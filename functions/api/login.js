import { signJwt } from './_jwt.js'

export async function onRequestPost(context) {
    const { password } = await context.request.json()

    if (!password || password !== context.env.ADMIN_PASSWORD) {
        return Response.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await signJwt({ role: 'admin' }, context.env.JWT_SECRET, '7d')
    return Response.json({ token })
}
