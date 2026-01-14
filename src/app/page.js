import MenuClient from './MenuClient'
export default async function Home() {
  const res = await fetch('http://localhost:3000/api')
  const rowData = await res.json();
  return (
    <MenuClient rows={rowData}/>
  );
}
