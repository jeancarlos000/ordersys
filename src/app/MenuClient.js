'use client'
import {useState} from 'react';
export default function MenuClient({rows}){
    const[cart,setCart] = useState([]);
    const[isSubmitting,setIsSubmitting] = useState(false);
    const[isSuccess,setIsSuccess] = useState(false);
    const[isError,setIsError] = useState(false);
    const[result,setResult] = useState({});

    function addToCart(row){
        const cartObject = structuredClone(row);
        cartObject.cartItemId = Date.now();
        setCart([...cart,cartObject])
    }

    function removeFromCart(item){
        setCart(cart.filter(food => food.cartItemId !== item.cartItemId))
    }

    async function handleClick(cart){
        setIsSubmitting(true);
        const countMap = {};

        cart.forEach(item => {
            const { id } = item;

            if (countMap[id]){
                countMap[id]++;
            } else {
                countMap[id] = 1;
            }
        })

        const orderContents = Object.keys(countMap).map(id => {
            return {
                id: id,
                quantity: countMap[id]
            };
        })

        const res = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderContents)
        });

        const order = await res.json();
        setResult(order)

        if(order.success){
            setIsSubmitting(false);
            setIsSuccess(true);
            setCart([]);
        } else {
            setIsSubmitting(false);
            setIsError(true);
        }

    }
    return (
    <div>
        <ul>
            {rows.map(row => (
                <li key={row.id}>
                    <h1>{row.name}</h1>
                    <p>{row.price}</p>
                    <button onClick={() => addToCart(row)}>Add to cart</button>
                </li>
            ))}
        </ul>
        <h1>Cart</h1>
        {cart.map(item => (
            <li key={item.cartItemId}>
                <h1>{item.name}</h1>
                <button onClick={() => removeFromCart(item)}>Remove from cart</button>
            </li>
        ))}
        {cart.length === 0 ? <h1>Cart is empty.</h1> : <button onClick={() => handleClick(cart)}>Submit order</button>}
        {isSubmitting ? <h1>Submitting..</h1> : <h1></h1>}
        {isSuccess ? <h1>{result.message}</h1> : <h1></h1>}
        {isError ? <h1>{result.message}</h1> : <h1></h1>}
    </div>
    )
}