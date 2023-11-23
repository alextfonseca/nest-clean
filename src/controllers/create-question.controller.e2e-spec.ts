import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { Test } from '@nestjs/testing'

import request from 'supertest'

describe('Create question (E2E)', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    jwtService = moduleRef.get<JwtService>(JwtService)

    await app.init()
  })

  test('[POST] /questions', async () => {
    const user = await prismaService.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@exemple.com',
        password: '123456',
      },
    })

    const accessToken = jwtService.sign({ sub: user.id })

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'How to create a question?',
        content: 'I want to create a question, but I do not know how to do it',
      })

    expect(response.statusCode).toBe(201)

    const questionOnDatabase = await prismaService.question.findFirst({
      where: {
        title: 'How to create a question?',
      },
    })

    expect(questionOnDatabase).toBeTruthy()
  })
})
