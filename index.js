const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(morgan('tiny'))
app.use(express.json())

morgan.token('body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
]

app.get('/', (req, res) => {
    res.send('<h1>Phonebook backend</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.get('/info', (req, res) => {
    const count = persons.length
    const now = new Date()
    res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${now}</p>
    `)
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    const name = body.name?.trim()
    const number = body.number?.trim()

    if (!name || !number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    const nameExists = persons.some(p => p.name === name)
    if (nameExists) {
        return res.status(400).json({ error: 'name must be unique' })
    }

    const person = {
        id: Math.floor(Math.random() * 1000000),
        name,
        number
    }

    persons = persons.concat(person)
    res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})