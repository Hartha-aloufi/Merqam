'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ExternalLink, Search } from 'lucide-react';
import { generateContent } from './actions';
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/client/components/ui/command';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/client/components/ui/form';
import { Input } from '@/client/components/ui/input';
import { Button } from '@/client/components/ui/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/client/components/ui/card';
import { Alert, AlertDescription } from '@/client/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/client/components/ui/radio-group';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/client/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/client/components/ui/select';
import { useRouter } from 'next/navigation';

const urlSchema = z.string().url('الرجاء إدخال رابط صحيح');

const formSchema = z
	.object({
		url: urlSchema,
		contentType: z.enum(['existing', 'new']),
		playlistId: z.string().optional(),
		newPlaylistId: z.string().optional(),
		newPlaylistTitle: z.string().optional(),
		speakerId: z.string().optional(),
		newSpeakerName: z.string().optional(),
		aiService: z.enum(['gemini', 'openai']).default('gemini'),
	})
	.refine(
		(data) => {
			if (data.contentType === 'existing') {
				return !!data.playlistId && !!data.speakerId;
			} else {
				return (
					!!data.newPlaylistId &&
					!!data.newPlaylistTitle &&
					(!!data.speakerId || !!data.newSpeakerName)
				);
			}
		},
		{
			message: 'معلومات المحتوى مطلوبة',
			path: ['playlistId'],
		}
	);

type FormData = z.infer<typeof formSchema>;

interface ContentGeneratorFormProps {
	userId: string;
	initialSpeakers: Array<{ id: string; name: string }>;
	initialPlaylists: Array<{
		youtube_playlist_id: string;
		title: string;
		speaker_id: string;
		speaker_name: string;
	}>;
}

export function ContentGeneratorForm({
	userId,
	initialSpeakers,
	initialPlaylists,
}: ContentGeneratorFormProps) {
	const [newLessonUrl, setNewLessonUrl] = useState<string>();
	const [openCombobox, setOpenCombobox] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	const filteredPlaylists = initialPlaylists.filter((playlist) =>
		playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			contentType: 'existing',
			url: '',
			aiService: 'gemini',
		},
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(data: FormData) {
		setIsSubmitting(true);
		setError(null);

		try {
			// Prepare input data based on content type
			const inputData = {
				url: data.url,
				userId,
				aiService: data.aiService,
				...(data.contentType === 'existing'
					? {
							playlistId: data.playlistId,
							speakerId: data.speakerId,
					  }
					: {
							newPlaylistId: data.newPlaylistId,
							newPlaylistTitle: data.newPlaylistTitle,
							...(data.speakerId === 'new'
								? { newSpeakerName: data.newSpeakerName }
								: { speakerId: data.speakerId }),
					  }),
			};

			const result = await generateContent(inputData);

			setNewLessonUrl(
				`/playlists/${result.playlistId}/lessons/${result.lessonId}`
			);
			router.refresh();
		} catch (err) {
			console.error('Error generating content:', err);
			setError(
				err instanceof Error
					? err.message
					: 'حدث خطأ أثناء إنشاء المحتوى'
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	// Watch for playlist selection to auto-select speaker
	const selectedPlaylistId = form.watch('playlistId');
	const selectedPlaylist = initialPlaylists.find(
		(p) => p.youtube_playlist_id === selectedPlaylistId
	);
	if (selectedPlaylist && !form.getValues('speakerId')) {
		form.setValue('speakerId', selectedPlaylist.speaker_id);
	}

	return (
		<Card className="border-2 relative">
			{isSubmitting && (
				<div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="text-center space-y-4">
						<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
						<p className="text-lg font-medium">
							جاري إنشاء الدرس...
						</p>
						<p className="text-sm text-muted-foreground">
							قد تستغرق العملية عدة دقائق
						</p>
					</div>
				</div>
			)}

			<CardHeader className="space-y-1">
				<CardTitle className="text-xl">إنشاء درس جديد</CardTitle>
				<CardDescription>
					قم بإنشاء درس جديد من صفحة النص المفرغ
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						{/* URL Field */}
						<FormField
							control={form.control}
							name="url"
							render={({ field }) => (
								<FormItem>
									<FormLabel>رابط النص المفرغ</FormLabel>
									<FormControl>
										<Input
											dir="ltr"
											disabled={isSubmitting}
											placeholder="https://..."
											className="font-mono text-sm text-left"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										أدخل رابط صفحة النص المفرغ
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Content Type Selection */}
						<FormField
							control={form.control}
							name="contentType"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>نوع المحتوى</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											defaultValue={field.value}
											className="space-y-4"
											disabled={isSubmitting}
										>
											{/* Existing Playlist Option */}
											<FormItem className="flex items-start space-x-reverse space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="existing" />
												</FormControl>
												<div className="space-y-2 flex-1">
													<FormLabel>
														إضافة إلى قائمة موجودة
													</FormLabel>
													<FormField
														control={form.control}
														name="playlistId"
														render={({ field }) => (
															<Popover
																open={
																	openCombobox
																}
																onOpenChange={
																	setOpenCombobox
																}
															>
																<PopoverTrigger
																	asChild
																>
																	<FormControl>
																		<Button
																			variant="outline"
																			role="combobox"
																			aria-expanded={
																				openCombobox
																			}
																			className="w-full justify-between"
																			disabled={
																				form.watch(
																					'contentType'
																				) !==
																					'existing' ||
																				isSubmitting
																			}
																		>
																			{field.value
																				? filteredPlaylists.find(
																						(
																							playlist
																						) =>
																							playlist.youtube_playlist_id ===
																							field.value
																				  )
																						?.title
																				: 'اختر قائمة'}
																			<Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																		</Button>
																	</FormControl>
																</PopoverTrigger>
																<PopoverContent className="w-full p-0">
																	<Command>
																		<CommandInput
																			placeholder="ابحث عن قائمة..."
																			onValueChange={
																				setSearchQuery
																			}
																		/>
																		<CommandList>
																			<CommandEmpty>
																				لم
																				يتم
																				العثور
																				على
																				نتائج
																			</CommandEmpty>
																			{filteredPlaylists.map(
																				(
																					playlist
																				) => (
																					<CommandItem
																						value={
																							playlist.title
																						}
																						key={
																							playlist.youtube_playlist_id
																						}
																						className="flex flex-col items-start"
																						onSelect={() => {
																							form.setValue(
																								'playlistId',
																								playlist.youtube_playlist_id
																							);
																							form.setValue(
																								'speakerId',
																								playlist.speaker_id
																							);
																							setOpenCombobox(
																								false
																							);
																						}}
																					>
																						<span>
																							{
																								playlist.title
																							}
																						</span>
																						<span className="text-sm text-muted-foreground">
																							{
																								playlist.speaker_name
																							}
																						</span>
																					</CommandItem>
																				)
																			)}
																		</CommandList>
																	</Command>
																</PopoverContent>
															</Popover>
														)}
													/>
												</div>
											</FormItem>

											{/* New Playlist Option */}
											<FormItem className="flex items-start space-x-reverse space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="new" />
												</FormControl>
												<div className="space-y-4 flex-1">
													<FormLabel>
														إنشاء قائمة جديدة
													</FormLabel>
													<div className="space-y-4 border-r-2 pr-4">
														<FormField
															control={
																form.control
															}
															name="newPlaylistId"
															render={({
																field,
															}) => (
																<FormItem>
																	<FormLabel>
																		معرف
																		القائمة
																	</FormLabel>
																	<FormControl>
																		<Input
																			dir="ltr"
																			placeholder="my-playlist"
																			disabled={
																				form.watch(
																					'contentType'
																				) !==
																					'new' ||
																				isSubmitting
																			}
																			className="text-left"
																			{...field}
																		/>
																	</FormControl>
																	<FormDescription>
																		معرف
																		فريد
																		للقائمة
																		(يستخدم
																		في
																		الروابط)
																	</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={
																form.control
															}
															name="newPlaylistTitle"
															render={({
																field,
															}) => (
																<FormItem>
																	<FormLabel>
																		عنوان
																		القائمة
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder="العنوان الظاهر للقائمة"
																			disabled={
																				form.watch(
																					'contentType'
																				) !==
																					'new' ||
																				isSubmitting
																			}
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Speaker Selection */}
						<FormField
							control={form.control}
							name="speakerId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>المتحدث</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="اختر المتحدث" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{initialSpeakers.map((speaker) => (
												<SelectItem
													key={speaker.id}
													value={speaker.id}
												>
													{speaker.name}
												</SelectItem>
											))}
											<SelectItem value="new">
												إضافة متحدث جديد...
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* New Speaker Name - shown only when "new" is selected in speaker dropdown */}
						{form.watch('speakerId') === 'new' && (
							<FormField
								control={form.control}
								name="newSpeakerName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											اسم المتحدث الجديد
										</FormLabel>
										<FormControl>
											<Input
												placeholder="اسم المتحدث"
												disabled={isSubmitting}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* AI Service */}
						<FormField
							control={form.control}
							name="aiService"
							render={({ field }) => (
								<FormItem>
									<FormLabel>خدمة الذكاء الاصطناعي</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="اختر خدمة الذكاء الاصطناعي" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="gemini">
												<div className="flex flex-col">
													<span>Google Gemini</span>
													<span className="text-sm text-muted-foreground">
														نسخة مجانية
													</span>
												</div>
											</SelectItem>
											<SelectItem value="openai">
												<div className="flex flex-col">
													<span>OpenAI GPT-4</span>
													<span className="text-sm text-muted-foreground">
														نسخة مدفوعة
													</span>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										اختر خدمة الذكاء الاصطناعي التي تريد
										استخدامها لمعالجة النص
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="flex gap-4 flex-col sm:flex-row">
							<Button
								type="submit"
								disabled={isSubmitting}
								className="min-w-[140px]"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="ml-2 h-4 w-4 animate-spin" />
										جاري الإنشاء...
									</>
								) : (
									'إنشاء الدرس'
								)}
							</Button>

							{newLessonUrl && (
								<Button
									variant="outline"
									onClick={() =>
										window.open(newLessonUrl, '_blank')
									}
								>
									<ExternalLink className="ml-2 h-4 w-4" />
									فتح الدرس الجديد
								</Button>
							)}
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
