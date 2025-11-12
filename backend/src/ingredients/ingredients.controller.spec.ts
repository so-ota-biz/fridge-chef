import { Test, TestingModule } from '@nestjs/testing'
import { IngredientsController } from '@/ingredients/ingredients.controller'
import { IngredientsService } from '@/ingredients/ingredients.service'

describe('IngredientsController', () => {
  let controller: IngredientsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [IngredientsService],
    }).compile()

    controller = module.get<IngredientsController>(IngredientsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
