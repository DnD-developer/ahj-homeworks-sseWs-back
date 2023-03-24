const http = require("http")
const Koa = require("koa")
const koaBody = require("koa-body")
const cors = require("@koa/cors")
const WS = require("ws")
const chatDb = require("./db")

const app = new Koa()

app.use(cors())

app.use(
	koaBody({
		urlencoded: true
	})
)

const server = http.createServer(app.callback())

const port = process.env.PORT || 3000

const wsServer = new WS.Server({
	server
})

function sendALL(data) {
	Array.from(wsServer.clients)
		.filter(client => client.readyState === WS.OPEN)
		.forEach(client => client.send(JSON.stringify(data)))
}

wsServer.on("connection", ws => {
	ws.on("message", request => {
		const data = JSON.parse(request)

		switch (data.type) {
			case "addUser":
				chatDb.users.push({ client: ws, name: data.user.name })

				sendALL({ type: "users", users: chatDb.users.filter(user => user.client.readyState === WS.OPEN).map(user => user.name) })
				break
			case "message":
				chatDb.messages.push(data.message)

				sendALL({
					type: "message",
					user: data.message.idParrent,
					message: data.message
				})
				break

			default:
				break
		}
	})

	ws.on("close", () => {
		sendALL({ type: "users", users: chatDb.users.filter(user => user.client.readyState === WS.OPEN).map(user => user.name) })
	})

	ws.send(
		JSON.stringify({
			type: "init",
			users: chatDb.users.filter(user => user.client.readyState === WS.OPEN).map(user => user.name),
			messages: chatDb.messages
		})
	)
})

server.listen(port, err => {
	if (err) {
		console.log(err)

		return
	}

	console.log("Server is listening to " + port)
})
