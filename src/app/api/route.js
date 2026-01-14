export const runtime = "nodejs";
import {pool} from "@/app/lib/db";
export async function GET(){
    const menu = await pool.query('SELECT * FROM menu');
    return Response.json(menu.rows)
}