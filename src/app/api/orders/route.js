export const runtime = "nodejs";
import {pool} from "@/app/lib/db";
export async function POST(request){
    const client = await pool.connect();
    let text = 'SELECT price FROM menu WHERE id = $1';

    let order_id = 0;

    try {
        await client.query('BEGIN');
        const req = await request.json();
        let total = 0;

        for(let i = 0; i < req.length; i++){
            const item_id = `${req[i].id}`;
            const result = await client.query(text,[item_id]);
            const price = result.rows[0].price;
            const curr_price = price * req[i].quantity;
            total += curr_price;
        }

        console.log(req);
        console.log(total);

        text = 'INSERT into orders(total) VALUES($1) RETURNING id';
        const result = await client.query(text,[`${total}`]);
        order_id = result.rows[0].id;
        text = 'INSERT into order_items(order_id, product_id, price, quantity) VALUES($1,$2,$3,$4)';

        for(let i = 0; i < req.length; i++){
            const item_id = `${req[i].id}`;
            const result = await client.query('SELECT price FROM menu WHERE id = $1',[item_id]);
            const item_price = `${result.rows[0].price}`;
            const item_quantity = `${req[i].quantity}`;
            await client.query(text,[order_id,item_id,item_price,item_quantity]);
        }
        
        await client.query('COMMIT');

    } catch (error) {
        console.error('Database error:',error);
        await client.query('ROLLBACK');
        return Response.json({
            success: false,
            error: 'ORDER_FAILED',
            message: 'Could not place order. Please retry.'
        })
    } finally {
        client.release();
    }
    return Response.json({
        success: true,
        orderId: order_id,
        message: 'Order placed.'
    });
}