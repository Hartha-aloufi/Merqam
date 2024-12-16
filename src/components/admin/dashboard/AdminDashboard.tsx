// src/components/admin/dashboard/AdminDashboard.tsx
"use client";

import { Topic } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlusCircle,
  BookOpen,
  Settings,
  FileText,
  Folder,
  ChevronLeft,
} from "lucide-react";

interface AdminDashboardProps {
  topics: Topic[];
  totalLessons: number;
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const QuickAction = ({ href, icon, title, description }: QuickActionProps) => (
  <Link href={href} className="block">
    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium leading-none">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronLeft className="mr-auto h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

export function AdminDashboard({ topics, totalLessons }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">
          مرحباً بك في لوحة التحكم. يمكنك إدارة المحتوى والإعدادات من هنا.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المواضيع
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topics.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدروس</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">إجراءات سريعة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <QuickAction
            href="/admin/generate"
            icon={<PlusCircle className="h-6 w-6" />}
            title="إنشاء درس جديد"
            description="إنشاء درس جديد من نص مفرغ"
          />
          <QuickAction
            href="/admin/topics"
            icon={<BookOpen className="h-6 w-6" />}
            title="إدارة المواضيع"
            description="إدارة وتنظيم المواضيع والدروس"
          />
        </div>
      </div>

      {/* Admin Workflows */}
      <div>
        <h2 className="text-lg font-semibold mb-4">سير العمل</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Content Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إدارة المحتوى</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/admin/generate">
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إنشاء درس جديد
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/admin/topics">
                    <BookOpen className="ml-2 h-4 w-4" />
                    تحرير المواضيع والدروس
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Site Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إعدادات الموقع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/admin/settings">
                    <Settings className="ml-2 h-4 w-4" />
                    الإعدادات العامة
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/admin/users">
                    <FileText className="ml-2 h-4 w-4" />
                    إدارة المستخدمين
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
