import { VideoTimeAt } from '@/components/video/VideoTimeAt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { TrackedElement } from './tracked-element';

// Define base MDX components with proper types
export const createMDXComponents = (indexGen: Generator<number>) => {
    return {

        h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h1
                className={cn(
                    "scroll-m-20 text-4xl font-bold tracking-tight mt-8 mb-4",
                    className
                )}
                {...props}
            />
        ),
        h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h2
                className={cn(
                    "scroll-m-20 text-3xl font-semibold tracking-tight mt-10 mb-4",
                    className
                )}
                {...props}
            />
        ),
        h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3
                className={cn(
                    "scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4",
                    className
                )}
                {...props}
            />
        ),
        p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
            <TrackedElement
                as="p"
                index={indexGen.next().value}
                className={cn(
                    "leading-7 [&:not(:first-child)]:mt-6",
                    className
                )}
                {...props}
            />
        ),
        ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
            <ul
                className={cn(
                    "my-6 mr-6 space-y-3 list-disc",
                    className
                )}
                {...props}
            />
        ),
        ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
            <ol
                className={cn(
                    "my-6 mr-6 space-y-3 list-decimal",
                    className
                )}
                {...props}
            />
        ),
        li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
            <li
                className={cn(
                    "mt-2",
                    className
                )}
                {...props}
            />
        ),
        // Custom components
        Alert: ({ title, children }: { title: string; children: React.ReactNode }) => (
            <Alert>
                {title && <AlertTitle>{title}</AlertTitle>}
                {children && <AlertDescription>{children}</AlertDescription>}
            </Alert>
        ),

        VideoTimeAt: ({
            startTime,
            endTime,
            children
        }: {
            startTime: number;
            endTime: number;
            children: React.ReactNode
        }) => (
            <VideoTimeAt startTime={startTime} endTime={endTime}>
                {children}
            </VideoTimeAt>
        ),
    } as const
}