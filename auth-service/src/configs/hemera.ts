import Hemera from 'nats-hemera'
import nats from 'nats'


const nc = nats.connect({
    servers: ['nats://nats:4222']
})


const hemera = new Hemera(nc, {
    name: 'auth-service'
} as any)


export default hemera

