/** Validates a Brazilian CPF (11 digits). Accepts only digits, no formatting. */
export function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calc = (digits: string, len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i)
    const rem = (sum * 10) % 11
    return rem === 10 || rem === 11 ? 0 : rem
  }

  return (
    calc(cpf, 9) === parseInt(cpf[9]) &&
    calc(cpf, 10) === parseInt(cpf[10])
  )
}

/** Validates a Brazilian CNPJ (14 digits). Accepts only digits, no formatting. */
export function isValidCnpj(cnpj: string): boolean {
  if (!/^\d{14}$/.test(cnpj)) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const calc = (digits: string, weights: number[]) => {
    let sum = 0
    for (let i = 0; i < weights.length; i++) sum += parseInt(digits[i]) * weights[i]
    const rem = sum % 11
    return rem < 2 ? 0 : 11 - rem
  }

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  return (
    calc(cnpj, w1) === parseInt(cnpj[12]) &&
    calc(cnpj, w2) === parseInt(cnpj[13])
  )
}

/** Strips all non-digit characters from a CPF/CNPJ string. */
export function stripDocument(value: string): string {
  return value.replace(/\D/g, '')
}
