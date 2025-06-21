import MyClientComponent from './MyClientComponent';

export default async function Page() {
    
    const formData = new FormData();

    console.log(`${process.env.ORIGIN_URL}/detection/count/138`);

    const res = await fetch(`${process.env.ORIGIN_URL}/detection/count/138`, {
        method: "GET",
        credentials: "include",
    });
    if (res.ok) {
        const data = await res.json();
        console.log(data);
        return <MyClientComponent data={data.count} />
    } else {
        return <MyClientComponent data={"error" + res.status} />
    }
}