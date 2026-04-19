/**
 * Shared validation utilities for ImuneCare
 * Keep all reusable validators here to avoid duplication and maintain consistency.
 */

// ─── Email ────────────────────────────────────────────────────────────────────
export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'E-mail é obrigatório'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'E-mail inválido'
  return null
}

// ─── Password ─────────────────────────────────────────────────────────────────
export function validatePassword(value: string): string | null {
  if (!value) return 'Senha é obrigatória'
  if (value.length < 8) return 'Mínimo de 8 caracteres'
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value))
    return 'Deve conter maiúscula, minúscula, número e caractere especial'
  return null
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Confirmação é obrigatória'
  if (password !== confirm) return 'As senhas não coincidem'
  return null
}

// ─── CPF ──────────────────────────────────────────────────────────────────────
export function validateCPF(cpf: string): string | null {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return 'CPF inválido'
  if (/^(\d)\1+$/.test(digits)) return 'CPF inválido'
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[9]) !== check) return 'CPF inválido'
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[10]) !== check) return 'CPF inválido'
  return null
}

// ─── Phone ────────────────────────────────────────────────────────────────────
export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return 'Telefone é obrigatório'
  if (digits.length !== 11) return 'Telefone inválido (11 dígitos)'
  return null
}

// ─── Name ─────────────────────────────────────────────────────────────────────
export function validateName(value: string, label = 'Nome'): string | null {
  if (!value.trim()) return `${label} é obrigatório`
  if (value.trim().length < 3) return `${label} deve ter ao menos 3 caracteres`
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value.trim())) return `${label} deve conter apenas letras`
  return null
}

// ─── Weight ───────────────────────────────────────────────────────────────────
export function validateWeight(value: string): string | null {
  if (!value.trim()) return 'Peso é obrigatório'
  const num = parseFloat(value.replace(',', '.'))
  if (isNaN(num) || num <= 0 || num > 500) return 'Peso inválido (0–500 kg)'
  return null
}

// ─── Birthdate (no future) ────────────────────────────────────────────────────
export function validateBirthdate(value: string): string | null {
  if (!value) return 'Data de nascimento é obrigatória'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value + 'T12:00')
  if (date > today) return 'Data de nascimento não pode ser futura'
  // minimum age: 0, maximum: 130 years
  const minDate = new Date(today)
  minDate.setFullYear(minDate.getFullYear() - 130)
  if (date < minDate) return 'Data de nascimento inválida'
  return null
}

// ─── Start date (no past) ─────────────────────────────────────────────────────
export function validateFutureDate(value: string, label = 'Data de início'): string | null {
  if (!value) return `${label} é obrigatória`
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value + 'T12:00')
  if (date < today) return 'Data inválida. Selecione uma data presente ou futura.'
  return null
}

// ─── Extrato (allergen extract field) ────────────────────────────────────────
/**
 * Pattern: one or more word-groups (alphabetic, accented) followed by a number and %,
 * optionally chained with " + ". Sum of all percentages must equal 100%.
 *
 * Valid:   "Der p 60% + Der f 10% + Blt 30%"
 * Valid:   "Blomia 100%"
 * Invalid: "Der-p 60%" (hyphen)
 * Invalid: "Der p 60% + Der f 30%" (sum ≠ 100)
 */
// Pattern per component: purely alphabetic words (incl. accented letters), then number%
// Rótulo: apenas letras e espaços — SEM números, SEM hífen, SEM pontuação no rótulo
// Valid:   "Der p 60%"  |  "Blomia tropicalis 100%"
// Invalid: "Der-p 60%"  |  "Der2 60%"  |  "60%"
const EXTRATO_COMPONENT_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+)*\s+\d+(?:\.\d+)?%$/

export function validateExtrato(value: string): string | null {
  if (!value.trim()) return 'Extrato é obrigatório'

  const parts = value.split('+').map((p) => p.trim())
  if (parts.length === 0 || (parts.length === 1 && !parts[0])) return 'Extrato inválido'

  for (const part of parts) {
    if (!EXTRATO_COMPONENT_RE.test(part)) {
      return `Componente inválido: "${part}". Use: Rótulo número% (ex: Der p 60%). Rótulo: somente letras e espaços, sem números, hífen ou pontuação.`
    }
  }

  // Sum of percentages must equal 100
  const total = parts.reduce((sum, part) => {
    const match = part.match(/(\d+(?:\.\d+)?)%$/)
    return sum + (match ? parseFloat(match[1]) : 0)
  }, 0)

  // Use small epsilon for floating point
  if (Math.abs(total - 100) > 0.01) {
    return `A soma dos percentuais deve ser 100% (atual: ${total.toFixed(1)}%)`
  }

  return null
}

// ─── Concentration (meta concentração) ───────────────────────────────────────
// Format: 1:N com ou sem separador de milhar (ex: 1:10, 1:1.000, 1:10.000)
export function validateConcentration(value: string): string | null {
  if (!value.trim()) return 'Concentração é obrigatória'
  if (!/^1:\d+(?:\.\d{3})*$/.test(value.trim())) return 'Formato inválido. Use 1:N (ex: 1:10, 1:1.000, 1:10.000)'
  return null
}

// ─── Volume (meta volume) ─────────────────────────────────────────────────────
// Format: positive number, up to 3 digits after decimal point, max 10ml
export function validateVolume(value: string): string | null {
  if (!value.trim()) return 'Volume é obrigatório'
  const normalized = value.replace(',', '.')
  if (!/^\d+(\.\d{1,3})?$/.test(normalized)) return 'Formato inválido (máx. 3 casas decimais, ex: 0.5)'
  const num = parseFloat(normalized)
  if (isNaN(num) || num <= 0) return 'Volume deve ser maior que 0'
  if (num > 10) return 'Volume inválido (máx. 10 ml)'
  return null
}

// ─── Formatters ───────────────────────────────────────────────────────────────
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatWeight(value: string): string {
  const cleaned = value.replace(/[^0-9,.]/g, '').replace(',', '.')
  const parts = cleaned.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('')
  return cleaned
}

// Enforce 1:N com separador de milhar auto-inserido (ex: 1:10.000 a partir de "10000")
export function formatConcentration(value: string): string {
  // Mantém apenas dígitos e `:` — descarta pontos que o usuário tenha digitado (recriamos)
  const cleaned = value.replace(/[^0-9:]/g, '')
  const parts = cleaned.split(':')
  const afterRaw = (parts.length > 1 ? parts.slice(1).join('') : parts[0]).replace(/\D/g, '').slice(0, 5)
  if (!afterRaw) return ''
  // Insere pontos como separador de milhar a cada 3 dígitos a partir da direita
  let withDots = ''
  for (let i = 0; i < afterRaw.length; i++) {
    const fromRight = afterRaw.length - i
    if (i > 0 && fromRight % 3 === 0) withDots += '.'
    withDots += afterRaw[i]
  }
  return `1:${withDots}`
}

// Enforce up to 3 decimal digits for volume
export function formatVolume(value: string): string {
  const cleaned = value.replace(/[^0-9,.]/g, '').replace(',', '.')
  const parts = cleaned.split('.')
  if (parts.length === 1) return parts[0]
  return parts[0] + '.' + parts[1].slice(0, 3)
}

// Today string YYYY-MM-DD
export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Tomorrow string YYYY-MM-DD
export function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
