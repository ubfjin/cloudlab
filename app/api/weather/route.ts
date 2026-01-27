import { NextRequest, NextResponse } from 'next/server';
import { dfs_xy_conv } from '@/utils/kma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lat, lon } = body;

        if (!lat || !lon) {
            return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
        }

        // Convert Lat/Lon to KMA Grid
        // "toXY" returns {x, y}
        const rs = dfs_xy_conv("toXY", lat, lon) as { x: number; y: number };

        // Get current date and time
        const now = new Date();
        // KMA API requires base_time in HHMM format.
        // Ultra Short Term Live calculates every hour on the hour. 
        // We should use the previous hour if minutes < 40 (API update delay), otherwise current hour.
        // However, safely, lets go back 1 hour to ensure data exists.
        // Actually official doc says: 
        // Base_time: 1000 -> API available after 10:10
        // So if current is 10:05, we must search for 0900.

        // Adjust for KST (Server might be UTC)
        // Assuming container has correct time or we offset it. 
        // Let's rely on simple logic: get "minutes ago" time.
        // Safe bet: usage time minus 45 minutes, round down to hour.
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset); // Basic adjustment if needed, but 'now' usually local on dev.

        // Let's use standard Date which usually picks up system time.
        // To be safe for KMA which is strictly KST:
        // We'll treat the input date as UTC and add 9 hours if we were on a UTC server.
        // But local dev is likely KST. KMA requires strict "YYYYMMDD" "HHMM".

        const getBaseDateTime = () => {
            const d = new Date();
            // Go back 45 mins to be safe for API update
            d.setMinutes(d.getMinutes() - 45);

            const pad = (n: number) => n < 10 ? `0${n}` : n;
            const year = d.getFullYear();
            const month = pad(d.getMonth() + 1);
            const day = pad(d.getDate());
            const hour = pad(d.getHours());

            // Ultra short live usually updates at 40 mins past hour, but base time is HH00
            // If we are at 10:30, -45m = 09:45. Hour is 09. Good.
            // If we are at 10:10, -45m = 09:25. Hour is 09. Good.

            return {
                base_date: `${year}${month}${day}`,
                base_time: `${hour}00`
            };
        };

        const { base_date, base_time } = getBaseDateTime();
        const API_KEY = process.env.KMA_API_KEY;

        if (!API_KEY) {
            return NextResponse.json({ error: 'Server configuration error: No API Key' }, { status: 500 });
        }

        const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${rs.x}&ny=${rs.y}`;

        console.log(`Fetching KMA Weather: ${url}`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.response.header.resultCode !== '00') {
            console.error('KMA API Error', data.response.header);
            return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
        }

        const items = data.response.body.items.item;
        // Map data
        // PTY: Precipitation Type (0: None, 1: Rain, 2: Rain/Snow, 3: Snow, 5: Rain, 6: Rain/Snow, 7: Snow)
        // REH: Humidity %
        // RN1: 1hr Precipitation mm
        // T1H: Temperature C
        // UUU, VVV, VEC, WSD: Wind

        const result = {
            temperature: items.find((i: any) => i.category === 'T1H')?.obsrValue,
            humidity: items.find((i: any) => i.category === 'REH')?.obsrValue,
            precipitation: items.find((i: any) => i.category === 'RN1')?.obsrValue,
            precipType: items.find((i: any) => i.category === 'PTY')?.obsrValue,
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Weather API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
