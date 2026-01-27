// React Native version of the Lambert Conformal Conic projection conversion
// Source: Korea Meteorological Administration

interface KMA_COORD {
    x: number;
    y: number;
}

interface LAT_LON {
    lat: number;
    lng: number;
}

export function dfs_xy_conv(code: string, v1: number, v2: number): KMA_COORD | LAT_LON {
    const RE = 6371.00877; // Earth radius (km)
    const GRID = 5.0; // Grid spacing (km)
    const SLAT1 = 30.0; // Projection latitude 1
    const SLAT2 = 60.0; // Projection latitude 2
    const OLON = 126.0; // Origin longitude
    const OLAT = 38.0; // Origin latitude
    const XO = 43; // Origin X coordinate (grid)
    const YO = 136; // Origin Y coordinate (grid)

    const DEGRAD = Math.PI / 180.0;
    const RADDEG = 180.0 / Math.PI;

    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    const rs = {};

    if (code === "toXY") {
        const lat = v1;
        const lng = v2;
        let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        let theta = lng * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;
        const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
        return { x, y };
    } else {
        // toLL
        const x = v1;
        const y = v2;
        const xn = x - XO;
        const yn = ro - y + YO;
        let ra = Math.sqrt(xn * xn + yn * yn);
        if (sn < 0.0) ra = -ra;
        let alat = Math.pow((re * sf) / ra, 1.0 / sn);
        alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

        let theta = 0.0;
        if (Math.abs(xn) <= 0.0) {
            theta = 0.0;
        } else {
            if (Math.abs(yn) <= 0.0) {
                theta = Math.PI * 0.5;
                if (xn < 0.0) theta = -theta;
            } else {
                theta = Math.atan2(xn, yn);
            }
        }
        const alon = theta / sn + olon;
        return {
            lat: alat * RADDEG,
            lng: alon * RADDEG
        };
    }
}
