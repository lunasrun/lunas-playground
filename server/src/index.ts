import { Application, Router, helpers } from '@oakserver/oak'
import { compile } from 'blve'

const app = new Application()

const router = new Router()

router.get('/app.js', (ctx) => {
  // get query params
  const { code } = helpers.getQuery(ctx, { mergeParams: true })
  const decodedCode = decodeURI(decode(code))
  console.log('decodedCode', decodedCode)
  const compiledCode = compile(decodedCode)
  const jsCode = compiledCode.js.replace(
    `'blve/dist/runtime'`,
    `'http://localhost:8000/static/runtime.js'`
  )
  // set MIME type as application/javascript
  ctx.response.type = 'application/javascript'
  ctx.response.body = jsCode
})

router.get('/app', (ctx) => {
  try {
    const { code } = helpers.getQuery(ctx, { mergeParams: true })
    const decodedCode = decodeURI(decode(code))
    const compiledCode = compile(decodedCode)
    ctx.response.body = {
      js: compiledCode.js,
      css: compiledCode.css,
    }
  } catch (e) {
    ctx.response.body = {
      err: String(e),
    }
  }
})

// allow access from http://localhost:5173/
app.use(async (context, next) => {
  context.response.headers.set(
    'Access-Control-Allow-Origin',
    'http://localhost:5173'
  )
  context.response.headers.set('Access-Control-Allow-Methods', 'GET, POST')
  context.response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  await next()
})

router.get('/static/(.*)', async (ctx) => {
  const path = ctx.params[0]
  try {
    await ctx.send({
      // It's running on Node.js, so we must not use Deno.cwd() to get the current working directory
      root: `${process.cwd()}/static/`,
      path,
    })
  } catch {
    ctx.response.status = 404
  }
})

app.use(router.routes())

app.listen({ port: 8000 })

function decode(base64String: string): string {
  return Buffer.from(base64String, 'base64').toString('utf-8')
}
