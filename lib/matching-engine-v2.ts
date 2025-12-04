import { createClient } from "@/lib/supabase/server"

/**
 * Interface para preferências avançadas do usuário
 */
export interface AdvancedJobPreferences {
  job_area: string
  country: string
  min_salary?: number
  max_salary?: number
  salary_currency?: string
  level?: string // Júnior, Pleno, Sênior, Especialista
  employment_type?: string // CLT, PJ, Freelance, Estágio
  remote?: boolean
  match_score_threshold?: number // 0-100
}

/**
 * Interface para vaga completa
 */
export interface Job {
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
  employment_type?: string
  remote?: boolean
  level?: string
  apply_url: string
  posted_at?: string
}

/**
 * Interface para breakdown do score
 */
export interface ScoreBreakdown {
  country: number
  area: number
  salary: number
  level: number
  employment_type: number
  remote: number
  total: number
}

/**
 * Pesos configuráveis para cálculo de match score
 */
export interface MatchWeights {
  country: number // 40% padrão
  area: number // 30% padrão
  salary: number // 15% padrão
  level: number // 8% padrão
  employment_type: number // 4% padrão
  remote: number // 3% padrão
}

const DEFAULT_WEIGHTS: MatchWeights = {
  country: 40,
  area: 30,
  salary: 15,
  level: 8,
  employment_type: 4,
  remote: 3,
}

/**
 * Motor de matching inteligente v2.0
 * Calcula score de 0-100 baseado em múltiplos critérios com pesos configuráveis
 */
export async function findMatchingJobsV2(
  userPreferences: AdvancedJobPreferences[],
  limit = 10,
  weights: MatchWeights = DEFAULT_WEIGHTS,
): Promise<Array<{ job: Job; score: number; breakdown: ScoreBreakdown }>> {
  const supabase = await createClient()

  if (userPreferences.length === 0) {
    return []
  }

  try {
    // Buscar vagas ativas
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("posted_at", { ascending: false })
      .limit(limit * 5) // Buscar mais para filtrar

    if (error) throw error

    // Calcular scores para cada vaga
    const scoredJobs = jobs.map((job) => {
      const bestMatch = findBestPreferenceMatch(job, userPreferences)
      const breakdown = calculateScoreBreakdown(job, bestMatch, weights)
      const totalScore = calculateTotalScore(breakdown, weights)

      return {
        job: job as Job,
        score: Math.round(totalScore),
        breakdown,
      }
    })

    // Filtrar por threshold mínimo e ordenar por score
    const threshold = userPreferences[0]?.match_score_threshold || 60
    const matchedJobs = scoredJobs
      .filter((item) => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Salvar scores no banco para analytics
    if (matchedJobs.length > 0) {
      await saveMatchScores(matchedJobs, userPreferences[0])
    }

    return matchedJobs
  } catch (error) {
    console.error("[Matching Engine V2] Erro:", error)
    return []
  }
}

/**
 * Encontra a preferência que melhor corresponde à vaga
 */
function findBestPreferenceMatch(job: Job, preferences: AdvancedJobPreferences[]): AdvancedJobPreferences {
  let bestMatch = preferences[0]
  let bestScore = 0

  preferences.forEach((pref) => {
    let score = 0

    // País (match exato = 1, diferente = 0)
    if (normalizeString(job.country) === normalizeString(pref.country)) {
      score += 40
    }

    // Área (similaridade)
    const areaSimilarity = calculateSimilarity(normalizeString(job.job_area), normalizeString(pref.job_area))
    score += areaSimilarity * 30

    if (score > bestScore) {
      bestScore = score
      bestMatch = pref
    }
  })

  return bestMatch
}

/**
 * Calcula breakdown detalhado do score
 */
function calculateScoreBreakdown(job: Job, preference: AdvancedJobPreferences, weights: MatchWeights): ScoreBreakdown {
  const breakdown: ScoreBreakdown = {
    country: 0,
    area: 0,
    salary: 0,
    level: 0,
    employment_type: 0,
    remote: 0,
    total: 0,
  }

  // País (0-100)
  if (normalizeString(job.country) === normalizeString(preference.country)) {
    breakdown.country = 100
  }

  // Área (0-100 baseado em similaridade)
  breakdown.area = Math.round(calculateSimilarity(normalizeString(job.job_area), normalizeString(preference.job_area)) * 100)

  // Salário (0-100)
  if (preference.min_salary && job.salary_min) {
    const jobSalary = job.salary_min
    const prefMinSalary = preference.min_salary

    if (jobSalary >= prefMinSalary) {
      breakdown.salary = 100
    } else {
      // Penalizar se salário está abaixo do mínimo desejado
      const diff = prefMinSalary - jobSalary
      const percentage = Math.max(0, 100 - (diff / prefMinSalary) * 100)
      breakdown.salary = Math.round(percentage)
    }
  } else {
    breakdown.salary = 50 // Neutro se não especificado
  }

  // Nível (0-100)
  if (preference.level && job.level) {
    const levelMatch = normalizeString(job.level) === normalizeString(preference.level)
    breakdown.level = levelMatch ? 100 : 50
  } else {
    breakdown.level = 50 // Neutro se não especificado
  }

  // Tipo de contrato (0-100)
  if (preference.employment_type && job.employment_type) {
    const typeMatch = normalizeString(job.employment_type) === normalizeString(preference.employment_type)
    breakdown.employment_type = typeMatch ? 100 : 0
  } else {
    breakdown.employment_type = 50 // Neutro se não especificado
  }

  // Remoto (0-100)
  if (preference.remote !== undefined) {
    if (job.remote === preference.remote) {
      breakdown.remote = 100
    } else {
      breakdown.remote = 0
    }
  } else {
    breakdown.remote = 50 // Neutro se não especificado
  }

  return breakdown
}

/**
 * Calcula score total ponderado
 */
function calculateTotalScore(breakdown: ScoreBreakdown, weights: MatchWeights): number {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)

  if (totalWeight === 0) return 0

  const weightedScore =
    (breakdown.country * weights.country +
      breakdown.area * weights.area +
      breakdown.salary * weights.salary +
      breakdown.level * weights.level +
      breakdown.employment_type * weights.employment_type +
      breakdown.remote * weights.remote) /
    totalWeight

  return Math.min(100, Math.max(0, weightedScore))
}

/**
 * Salva scores calculados no banco para analytics
 */
async function saveMatchScores(
  scoredJobs: Array<{ job: Job; score: number; breakdown: ScoreBreakdown }>,
  preference: AdvancedJobPreferences,
) {
  const supabase = await createClient()

  // Buscar user_id da preferência
  const { data: prefData } = await supabase
    .from("job_preferences")
    .select("user_id")
    .eq("job_area", preference.job_area)
    .eq("country", preference.country)
    .maybeSingle()

  if (!prefData) return

  const scoresToInsert = scoredJobs.map((item) => ({
    user_id: prefData.user_id,
    job_id: item.job.id,
    match_score: item.score,
    score_breakdown: item.breakdown,
    calculated_at: new Date().toISOString(),
  }))

  // Upsert scores (atualizar se já existir)
  await supabase.from("job_match_scores").upsert(scoresToInsert, {
    onConflict: "user_id,job_id",
  })
}

/**
 * Verifica se uma vaga tem match alto (≥80) e deve ser enviada como prioritária
 */
export async function checkHighMatchJob(userId: string, jobId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: scoreData } = await supabase
    .from("job_match_scores")
    .select("match_score")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle()

  return scoreData ? scoreData.match_score >= 80 : false
}

/**
 * Registra alerta prioritário enviado
 */
export async function recordPriorityAlert(
  userId: string,
  jobId: string,
  sentJobId: string,
  matchScore: number,
  sentVia: "whatsapp" | "email" | "telegram" = "whatsapp",
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from("priority_job_alerts").insert({
      user_id: userId,
      job_id: jobId,
      sent_job_id: sentJobId,
      match_score: matchScore,
      sent_via: sentVia,
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error("[Matching Engine V2] Erro ao registrar alerta prioritário:", error)
    return false
  }
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

