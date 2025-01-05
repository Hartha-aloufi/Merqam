// src/lib/txt-to-mdx/index.ts
import OpenAI from 'openai';
import { syncWithVideo } from './sync-with-video';
import path from 'path';
import fs from 'fs/promises';
import { createDir } from '@/client/lib/utils/fs';
import { ScraperFactory } from './scrapers';
import { logger } from './scrapers/logger';

export interface ConversionResult {
	mdxPath: string;
	videoId: string;
	title: string;
}

export class TxtToMdxConverter {
	private openai: OpenAI;
	private dataPath: string;

	constructor(
		apiKey: string,
		dataPath: string = path.join(process.cwd(), 'src/data')
	) {
		this.openai = new OpenAI({
			apiKey: apiKey,
		});
		this.dataPath = dataPath;
	}

	async processContent(
		url: string,
		topicId: string
	): Promise<ConversionResult> {
		try {
			// Get appropriate scraper based on URL
			const scraper = ScraperFactory.getScraper(url);

			// Create directories
			const topicPath = path.join(this.dataPath, topicId);
			await createDir(topicPath);
			const tempDir = path.join(process.cwd(), 'temp');
			await createDir(tempDir);

			// Download transcripts and get video info
			logger.info('Starting transcript download...');
			const {
				videoId,
				title,
				files: { txt: txtPath, srt: srtPath },
			} = await scraper.scrape(url, tempDir);
			logger.info('Transcript download complete', {
				txtPath,
				srtPath,
				title,
			});

			// Verify files exist
			try {
				await fs.access(txtPath);
				await fs.access(srtPath);
				logger.info('Verified files exist', { txtPath, srtPath });
			} catch (error) {
				throw new Error(`Downloaded files not found: ${error.message}`);
			}

			// Read and process content with OpenAI
			logger.info('Reading TXT file...');
			const txtContent = await fs.readFile(txtPath, 'utf-8');
			logger.info('Processing with OpenAI...');
			const processedContent = await this.processWithOpenAI(
				txtContent,
				title
			);

			// Create temporary MDX
			const tempMdxPath = path.join(tempDir, `${videoId}_temp.mdx`);
			await fs.writeFile(tempMdxPath, processedContent);
			logger.info('Created temp MDX file', { tempMdxPath });

			// Sync with video timestamps
			const finalMdxPath = path.join(topicPath, `${videoId}.mdx`);
			await syncWithVideo(tempMdxPath, srtPath, finalMdxPath);
			logger.info('Created final MDX with timestamps', { finalMdxPath });

			// Cleanup temp files
			try {
				await fs.unlink(tempMdxPath);
				await fs.unlink(txtPath);
				await fs.unlink(srtPath);
				logger.info('Cleaned up temp files');
			} catch (error) {
				logger.warn('Error cleaning up temp files:', error);
			}

			return {
				mdxPath: finalMdxPath,
				videoId,
				title,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			logger.error('Process content error', { error: errorMessage });
			throw new Error(`Failed to process content: ${errorMessage}`);
		}
	}

	private async processWithOpenAI(
		content: string,
		title: string
	): Promise<string> {
		const completion = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: [
						{
							type: 'text',
							text: 'قم بتدقيق النص العربي المأخوذ من مقاطع اليوتيوب وذلك بإصلاح الأخطاء الإملائية، إضافة الحركات على الأحرف عند اللزوم فقط، وإضافة علامات الترقيم. وتقسيم النص الى فقرات حتى يسهل قرائته. من المهم جدًا الحفاظ على النص الأصلي دون تغيير في المحتوى أو الأسلوب.\n\n# خطوات التدقيق اللغوي\n\n- **إصلاح الأخطاء الإملائية**: راجع جميع الكلمات لضمان صحتها الإملائية وقم بتصحيح أي أخطاء موجودة.\n- **إضافة الحركات**: أضف الحركات فقط حيث يكون من الضروري لتوضيح النطق الصحيح للكلمات أو تفادي الالتباس.\n- **إضافة علامات الترقيم**: تأكد من وضع علامات الترقيم الصحيحة مثل الفواصل والنقاط وعلامات الاستفهام في أماكنها المناسبة لتحسين وضوح وفهم النص.\n- **الحفاظ على النص الأصلي**: التزم بمضمون النص ولا تقم بتغيير صيغه أو إعادة صياغته بأي شكل.\n- قسم النص الى فقرات\n\n# صيغة الإخراج\n\nقدم النص المدقق مع جميع التصحيحات المطلوبة بوضوح ودون تغيير للمحتوى الأصلي.\n\n# أمثلة\n\n**النص الأصلي:** \nفي هذا المقطع انا كنت بتكلم عن كيف نقدر نشتغل شوي احسن وفعاليه اكثر مع اشغالنا \n\n**النص المدقق:** \nفي هذا المقطع، كنت أتكلم عن كيف نستطيع أن نشتغلَ بشكلٍ أفضل وفعاليةٍ أكثر مع أعمالنا.\n\n# ملاحظات\n\n- لا تتدخل في اللهجات أو التعبيرات المحلية الخاصة إلا عند وجود أخطاء إملائية جلية طالب تغييرها.\n- يجب ان لا يحتوي الرد على اي شيء زائد, مثل : "النص المدقق" او غيرها.\n- استبدل جميع انواع الاقواس المعقوفة "{}" بالاقواس الهلالية "()"\n- لا تقم ابدا بجعل اي يبدو غامقا, يعني لا تستخدم "**"\n',
						},
					],
				},
				{
					role: 'user',
					content: content,
				},
			],
			temperature: 0.84,
			max_tokens: 16383,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});

		const processedContent = completion.choices[0].message.content;
		return `# ${title}\n\n${processedContent}`;
	}
}
