// src/components/admin/lesson-generator/form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ExternalLink } from "lucide-react";
import { Topic } from "@/types";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { adminLessonsService } from "@/services/admin/lessons.service";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    isLoading,
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
      setNewLessonUrl(`/admin/topics/${data.topicId}/${data.lessonId}/edit`);
    },
  });

  function onSubmit(data: FormData) {
    generateLesson(data);
  }

  return (
    <Card className="border-2">
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
                    <Input placeholder="أدخل عنوان الدرس" {...field} />
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
                              <Select
                                disabled={
                                  form.watch("topicType") !== "existing"
                                }
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر موضوعاً" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {existingTopics.map((topic) => (
                                    <SelectItem key={topic.id} value={topic.id}>
                                      {topic.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                        form.watch("topicType") !== "new"
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
                                        form.watch("topicType") !== "new"
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
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
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
