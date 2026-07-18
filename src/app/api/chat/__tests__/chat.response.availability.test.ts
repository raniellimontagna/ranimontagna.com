import { validateChatAnswer } from '../chat.response'
import { createValidationInput } from './chat.response.fixtures'

describe('project availability validation', () => {
  it.each([
    'Não estou disponível para projetos avulsos no momento.',
    'Minha agenda é dedicada ao meu compromisso com a Lemon Energia.',
    'Por trabalhar na Lemon, não posso aceitar outros projetos.',
  ])('rejects a false categorical unavailability claim: %s', (answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          visitorMessage: 'Está disponível para fazer um projeto para mim?',
        }),
      ),
    ).toEqual({ ok: false, code: 'availability-conflict' })
  })

  it.each([
    [
      'pt',
      'Está disponível para fazer um projeto para mim?',
      'Sim, posso avaliar projetos dependendo da proposta, do escopo e da minha disponibilidade.',
    ],
    [
      'en',
      'Are you available for a project?',
      'I can evaluate projects depending on the proposal, scope, fit, and my availability.',
    ],
    [
      'es',
      '¿Estás disponible para un proyecto?',
      'Puedo evaluar proyectos según la propuesta, el alcance y mi disponibilidad.',
    ],
  ] as const)('accepts conditional project availability in %s', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('does not apply the project rule to an unrelated question', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Não estou disponível para conversar sobre esse assunto.', {
          visitorMessage: 'Qual é a sua tecnologia favorita?',
        }),
      ),
    ).toEqual({ ok: true })
  })
})
