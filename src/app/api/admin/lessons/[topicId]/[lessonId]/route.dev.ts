// app/api/admin/lessons/[topicId]/[lessonId]/route.ts
import { NextResponse } from 'next/server';
import { getLesson } from '@/utils/mdx';

export async function GET(
    request: Request,
    { params }: { params: { topicId: string; lessonId: string } }
) {
    try {
        const lesson = await getLesson(params.topicId, params.lessonId);
        if (!lesson) {
            return new NextResponse('Lesson not found', { status: 404 });
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('[ADMIN API] Error fetching lesson:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { topicId: string; lessonId: string } }
) {
    try {
        const body = await request.json();

        // TODO: Implement lesson update logic
        // For now, return mock response
        return NextResponse.json({
            id: params.lessonId,
            ...body
        });
    } catch (error) {
        console.error('[ADMIN API] Error updating lesson:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}