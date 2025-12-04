import { createClient } from "@/lib/supabase/server"

interface JobPreference {
  job_area: string
  country: string
}

interface Job {
  id: string
  title: string
  description: string
  company_name: string
  job_area: string
  country: string
  city?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  apply_url: string
}

/**
 * Motor de matching para encontrar vagas que correspondem às preferências do usuário
 * Utiliza algoritmo de correspondência fuzzy para maior flexibilidade
 */
export async function findMatchingJobs(userPreferences: JobPreference[], limit = 5): Promise<Job[]> {
  const supabase = await createClient()

  if (userPreferences.length === 0) {
    return []
  }

  try {
    // Construir query com OR logic para encontrar vagas que correspondem a qualquer preferência
    const query = supabase
      .from("jobs")
      .select("*")
      .gte("expires_at", new Date().toISOString())
      .order("posted_at", { ascending: false })
      .limit(limit * 3) // Buscar mais para filtrar

    // Filtrar por país e área de trabalho
    const { data: jobs, error } = await query

    if (error) throw error

    // Realizar matching manual com lógica de scoring
    const scoredJobs = jobs.map((job) => ({
      job,
      score: calculateMatchScore(job, userPreferences),
    }))

    // Filtrar jobs com score > 0.5 e ordenar por score
    const matchedJobs = scoredJobs
      .filter((item) => item.score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.job)

    return matchedJobs
  } catch (error) {
    console.error("[v0] Erro no motor de matching:", error)
    return []
  }
}

/**
 * Calcula score de compatibilidade entre job e preferências do usuário (0-1)
 */
function calculateMatchScore(job: Job, preferences: JobPreference[]): number {
  let totalScore = 0
  let matchCount = 0

  preferences.forEach((pref) => {
    // Score baseado em correspondência exata de país
    const countryMatch = normalizeString(job.country) === normalizeString(pref.country) ? 1 : 0

    // Score para área de trabalho (fuzzy matching)
    const jobAreaSimilarity = calculateSimilarity(normalizeString(job.job_area), normalizeString(pref.job_area))

    // Combinar scores (40% país, 60% área)
    const pairScore = countryMatch * 0.4 + jobAreaSimilarity * 0.6

    totalScore += pairScore
    matchCount++
  })

  return matchCount > 0 ? totalScore / matchCount : 0
}

/**
 * Calcula similaridade entre duas strings (0-1) usando algoritmo Levenshtein
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calcula distância de edição entre duas strings
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let k = 0; k <= s1.length; k++) {
    let lastValue = k
    for (let i = 0; i <= s2.length; i++) {
      if (k === 0) {
        costs[i] = i
      } else if (i > 0) {
        let newValue = costs[i - 1]
        if (s1.charAt(k - 1) !== s2.charAt(i - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[i]) + 1
        }
        costs[i - 1] = lastValue
        lastValue = newValue
      }
    }
    if (k > 0) {
      costs[s2.length] = lastValue
    }
  }

  return costs[s2.length]
}

/**
 * Normaliza string para comparação (minúsculas, sem acentos)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/**
 * Registra uma vaga como enviada para um usuário
 */
export async function recordSentJob(userId: string, jobId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("sent_jobs").upsert({
      user_id: userId,
      job_id: jobId,
      sent_at: new Date().toISOString(),
      view_status: "pending",
    })

    if (error && error.code !== "23505") {
      // 23505 is unique constraint violation, which is fine
      throw error
    }

    return true
  } catch (error) {
    console.error("[v0] Erro ao registrar vaga enviada:", error)
    return false
  }
}

/**
 * Atualiza status da vaga para o usuário
 */
export async function updateSentJobStatus(
  userId: string,
  jobId: string,
  status: "viewed" | "applied" | "dismissed",
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("sent_jobs")
      .update({ view_status: status })
      .eq("user_id", userId)
      .eq("job_id", jobId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] Erro ao atualizar status da vaga:", error)
    return false
  }
}
