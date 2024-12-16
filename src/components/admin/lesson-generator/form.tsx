"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ExternalLink, Search } from "lucide-react";
import { Topic } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { adminLessonsService } from "@/services/admin/lessons.service";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const urlSchema = z.string().refine((url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === "baheth.ieasybooks.com";
  } catch {
    return false;
  }
}, "الرجاء إدخال رابط صحيح من موقع باحث");

const formSchema = z
  .object({
    url: urlSchema,
    title: z.string().min(2, "العنوان يجب أن يكون 3 أحرف على الأقل"),
    topicType: z.enum(["existing", "new"]),
    topicId: z.string().optional(),
    newTopicId: z.string().optional(),
    newTopicTitle: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.topicType === "existing") {
        return !!data.topicId;
      } else {
        return !!data.newTopicId && !!data.newTopicTitle;
      }
    },
    {
      message: "معلومات الموضوع مطلوبة",
      path: ["topicId"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface LessonGeneratorFormProps {
  existingTopics: Topic[];
}

export function LessonGeneratorForm({
  existingTopics,
}: LessonGeneratorFormProps) {
  const [newLessonUrl, setNewLessonUrl] = useState<string>();
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter topics based on search
  const filteredTopics = existingTopics.filter((topic) =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topicType: "existing",
      url: "",
      title: "",
    },
  });

  const {
    mutate: generateLesson,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (data: FormData) => {
      const topicId =
        data.topicType === "existing" ? data.topicId : data.newTopicId;
      const topicTitle =
        data.topicType === "existing"
          ? existingTopics.find((t) => t.id === data.topicId)?.title
          : data.newTopicTitle;

      return adminLessonsService.generateLesson({
        url: data.url,
        title: data.title,
        topicId: topicId!,
        topicTitle: topicTitle!,
      });
    },
    onSuccess: (data) => {
      setNewLessonUrl(`/topics/${data.topicId}/${data.lessonId}`);
    },
  });

  function onSubmit(data: FormData) {
    generateLesson(data);
  }

  return (
    <Card className="border-2 relative">
      {isPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">جاري إنشاء الدرس...</p>
            <p className="text-sm text-muted-foreground">
              قد تستغرق العملية عدة دقائق
            </p>
          </div>
        </div>
      )}

      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">إنشاء درس جديد</CardTitle>
        <CardDescription>
          قم بإنشاء درس جديد من صفحة النص المفرغ في موقع باحث
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      placeholder="https://baheth.ieasybooks.com/..."
                      className="font-mono text-sm text-left"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    أدخل رابط صفحة النص المفرغ من موقع باحث
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الدرس</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل عنوان الدرس"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Topic Selection */}
            <FormField
              control={form.control}
              name="topicType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>الموضوع</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-4"
                      disabled={isPending}
                    >
                      {/* Existing Topic Option */}
                      <FormItem className="flex items-start space-x-reverse space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="existing" />
                        </FormControl>
                        <div className="space-y-2 flex-1">
                          <FormLabel>اختر موضوعاً موجوداً</FormLabel>
                          <FormField
                            control={form.control}
                            name="topicId"
                            render={({ field }) => (
                              <Popover
                                open={openCombobox}
                                onOpenChange={setOpenCombobox}
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={openCombobox}
                                      className="w-full justify-between"
                                      disabled={
                                        form.watch("topicType") !==
                                          "existing" || isPending
                                      }
                                    >
                                      {field.value
                                        ? existingTopics.find(
                                            (topic) => topic.id === field.value
                                          )?.title
                                        : "اختر موضوعاً"}
                                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="ابحث عن موضوع..."
                                      onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        لم يتم العثور على نتائج
                                      </CommandEmpty>
                                      {filteredTopics.map((topic) => (
                                        <CommandItem
                                          value={topic.title}
                                          key={topic.id}
                                          onSelect={() => {
                                            form.setValue("topicId", topic.id);
                                            setOpenCombobox(false);
                                          }}
                                        >
                                          {topic.title}
                                        </CommandItem>
                                      ))}
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            )}
                          />
                        </div>
                      </FormItem>

                      {/* New Topic Option */}
                      <FormItem className="flex items-start space-x-reverse space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="new" />
                        </FormControl>
                        <div className="space-y-4 flex-1">
                          <FormLabel>أنشئ موضوعاً جديداً</FormLabel>
                          <div className="space-y-4 border-r-2 pr-4">
                            <FormField
                              control={form.control}
                              name="newTopicId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>معرف الموضوع</FormLabel>
                                  <FormControl>
                                    <Input
                                      dir="ltr"
                                      placeholder="quran-tafseer"
                                      disabled={
                                        form.watch("topicType") !== "new" ||
                                        isPending
                                      }
                                      className="text-left"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    معرف فريد للموضوع (يستخدم في الروابط)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="newTopicTitle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>عنوان الموضوع</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="تفسير القرآن"
                                      disabled={
                                        form.watch("topicType") !== "new" ||
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  حدث خطأ أثناء إنشاء الدرس. الرجاء المحاولة مرة أخرى.
                </AlertDescription>
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
                  "إنشاء الدرس"
                )}
              </Button>

              {newLessonUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(newLessonUrl, "_blank")}
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
