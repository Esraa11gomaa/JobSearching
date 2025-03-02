import { Server } from "socket.io";

const io = new Server({
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("newApplication", (jobId) => {
        socket.join(jobId);
    });

    socket.on("joinCompany", (companyId) => {
        socket.join(companyId);
    });

    socket.on("applicationStatusUpdated", (applicationId) => {
        socket.join(applicationId);
    });

    socket.on("joinChat", ({ chatId }) => {
        socket.join(chatId);
    })
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

export default { io };
