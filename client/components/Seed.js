import axios from 'axios';
import React, { useEffect } from 'react';


const SeedPage = () => {

    useEffect(() => { seedData() }, [])

    const seedData = async () => {
        const seededData = await axios.post("/api/v1/seed")
    }

    return (
        <div>
            <h1>React SeedPage</h1>
        </div>
    );
}

export default SeedPage;