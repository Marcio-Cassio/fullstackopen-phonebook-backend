require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const path = require('path')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
    res.send('<h1>Phonebook backend</h1>')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
      .then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).end()
        }
      })
      .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    Person.countDocuments({})
      .then(count => {
        const now = new Date()
        res.send(`
          <p>Phonebook has info for ${count} people</p>
          <p>${now}</p>    
        `)
      })
      .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    const name = body.name?.trim()
    const number = body.number?.trim()

    if (!name || !number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    Person.findOne({ name }).then(existingPerson => {
        if (existingPerson) {
            return res.status(400).json({ error: 'name must be unique' })
        }

        const person = new Person({ name, number })

        return person.save().then(savedPerson => {
            res.json(savedPerson)
        })
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body

    Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )
      .then(updatedPerson => {
        res.json(updatedPerson)
      })
      .catch(error => next(error))   
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
      .then(() => {
        res.status(204).end()
      })
      .catch(error => next(error))
})

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
