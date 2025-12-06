
import express, { Request, Response } from "express"
const app = express();
const port = 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('Next level Web development is running..!')
});

app.listen(port, () => {
    console.log(`Server is running  on port ${port}`)
});


