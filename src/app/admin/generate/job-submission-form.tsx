'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ExternalLink, Search } from 'lucide-react';
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
	CardFooter,
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
import { useSubmitGenerationJob } from '@/client/hooks/use-job-query';
import Link from 'next/link';

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

interface JobSubmissionFormProps {
	userId: string;
	initialSpeakers: Array<{ id: string; name: string }>;
	initialPlaylists: Array<{
		youtube_playlist_id: string;
		title: string;
		speaker_id: string;
		speaker_name: string;
	}>;
}

export function JobSubmissionForm({
	userId,
	initialSpeakers,
	initialPlaylists,
}: JobSubmissionFormProps) {
	const [openCombobox, setOpenCombobox] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

  // Use our custom hook
	const { mutate: submitJob, isPending, isSuccess, data: jobResult } = useSubmitGenerationJob();

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

	const [error, setError] = useState<string | null>(null);

	async function onSubmit(data: FormData) {
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

      // Submit the job using our hook
			submitJob(inputData);
		} catch (err) {
			console.error('Error submitting job:', err);
			setError(
				err instanceof Error
					? err.message
					: 'حدث خطأ أثناء إنشاء المهمة'
			);
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
			{isPending && (
				<div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="text-center space-y-4">
						<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
						<p className="text-lg font-medium">
							جاري إنشاء المهمة...
						</p>
						<p className="text-sm text-muted-foreground">
							سيتم وضع المهمة في قائمة الانتظار
						</p>
					</div>
				</div>
			)}

			<CardHeader className="space-y-1">
				<CardTitle className="text-xl">إنشاء مهمة توليد درس جديد</CardTitle>
				<CardDescription>
					قم بإنشاء درس جديد من صفحة النص المفرغ باستخدام نظام المهام
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
											disabled={isPending}
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
											disabled={isPending}
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
																				isPending
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
																				isPending
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
																				isPending
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
										disabled={isPending}
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
												disabled={isPending}
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
										disabled={isPending}
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
								disabled={isPending}
								className="min-w-[140px]"
							>
								{isPending ? (
									<>
										<Loader2 className="ml-2 h-4 w-4 animate-spin" />
										جاري الإنشاء...
									</>
								) : (
									'إنشاء المهمة'
								)}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>

      {isSuccess && jobResult && (
        <CardFooter className="border-t bg-muted/50 flex flex-col items-start gap-4 px-6 py-4">
          <div>
            <h3 className="font-medium text-sm">تم إنشاء المهمة بنجاح!</h3>
            <p className="text-sm text-muted-foreground">
              سيتم معالجة المهمة في الخلفية. يمكنك متابعة التقدم من خلال صفحة المهام.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                form.reset();
                router.refresh();
              }}
            >
              إنشاء مهمة جديدة
            </Button>
            <Button 
              size="sm"
              asChild
            >
              <Link href={`/admin/jobs/${jobResult.jobId}`}>
                <ExternalLink className="ml-2 h-4 w-4" />
                مشاهدة المهمة
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
		</Card>
	);
}