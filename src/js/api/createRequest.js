const createRequest = async ( {method, endpoint, body} ) => {
    const response = await fetch(`https://backend-sse-ws.onrender.com/${endpoint}`, {
        method,
        body: JSON.stringify(body)
    });
    return response.json();  
};

export default createRequest;