// fetch from 'node-fetch';
/* fetch('https://api.imlolicon.tk/api/words', {
    method: "POST",
    headers: {
        Authorization: "",
        "Content-type": "application/json"
    },
    body: JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{ "role": "user", "content": "你好" }]
    })
}).then(response => response.json())
.then((ad: any) => {
    console.log(ad)
}) */
(async () => {
    const a = await import('./plugins/claude');
    console.log(a.default)
})()