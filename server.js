const http = require("http")
const Koa = require("koa")
const koaBody = require("koa-body")
const cors = require("@koa/cors")
const WS = require("ws")

const app = new Koa()

app.use(cors())

app.use(
	koaBody({
		urlencoded: true,
		multipart: true
	})
)

const server = http.createServer(app.callback())

const port = process.env.PORT || 7070

const wsServer = new WS.Server({
	server
})

server.listen(port, err => {
	if (err) {
		console.log(err)

		return
	}

	console.log("Server is listening to " + port)
})
