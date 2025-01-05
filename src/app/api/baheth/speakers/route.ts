// src/app/api/baheth/speakers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BahethService } from '@/server/services/baheth.service';

const bahethService = new BahethService();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('query') || '';
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');

		const data = await bahethService.searchSpeakers(query, page, limit);
		return NextResponse.json(data);
	} catch (error) {
		console.error('Baheth API error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch speakers' },
			{ status: 500 }
		);
	}
}
