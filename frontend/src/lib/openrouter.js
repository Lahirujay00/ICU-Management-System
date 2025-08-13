const OPENROUTER_API_KEY = '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'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export async function analyzePatientRisk(patientData) {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ICU Management System'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `You are an AI medical assistant analyzing ICU patient data to assess risk levels. 
            Analyze the patient's vital signs, lab results, and medical history to provide:
            1. A risk score (1-10, where 10 is highest risk)
            2. Risk factors identified
            3. Recommended interventions
            4. Monitoring frequency suggestions
            
            Respond in JSON format with these fields:
            {
              "riskScore": number,
              "riskLevel": "low|medium|high|critical",
              "riskFactors": [string],
              "recommendations": [string],
              "monitoringFrequency": string,
              "confidence": number
            }`
          },
          {
            role: 'user',
            content: `Analyze this patient data for risk assessment: ${JSON.stringify(patientData)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)
    
    return {
      success: true,
      analysis
    }
  } catch (error) {
    console.error('Error analyzing patient risk:', error)
    return {
      success: false,
      error: error.message,
      analysis: {
        riskScore: 5,
        riskLevel: 'medium',
        riskFactors: ['Unable to analyze - system error'],
        recommendations: ['Please review patient data manually'],
        monitoringFrequency: 'Every 2 hours',
        confidence: 0
      }
    }
  }
}

export async function generateClinicalInsights(patientData, context) {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ICU Management System'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `You are an AI medical assistant providing clinical insights for ICU patients. 
            Analyze the provided data and context to offer:
            1. Clinical observations
            2. Potential complications to watch for
            3. Treatment optimization suggestions
            4. Patient education points
            
            Keep responses concise and clinically relevant.`
          },
          {
            role: 'user',
            content: `Patient data: ${JSON.stringify(patientData)}\n\nContext: ${context}`
          }
        ],
        temperature: 0.1,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      insights: data.choices[0].message.content
    }
  } catch (error) {
    console.error('Error generating clinical insights:', error)
    return {
      success: false,
      error: error.message,
      insights: 'Unable to generate clinical insights at this time.'
    }
  }
}

export async function predictPatientOutcome(patientData) {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ICU Management System'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `You are an AI medical assistant predicting patient outcomes in the ICU. 
            Based on the patient data, provide:
            1. Likelihood of recovery (percentage)
            2. Expected length of stay
            3. Potential complications
            4. Discharge readiness indicators
            
            Respond in JSON format:
            {
              "recoveryLikelihood": number,
              "expectedStayDays": number,
              "complications": [string],
              "dischargeIndicators": [string],
              "confidence": number
            }`
          },
          {
            role: 'user',
            content: `Predict outcome for this patient: ${JSON.stringify(patientData)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 600
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const prediction = JSON.parse(data.choices[0].message.content)
    
    return {
      success: true,
      prediction
    }
  } catch (error) {
    console.error('Error predicting patient outcome:', error)
    return {
      success: false,
      error: error.message,
      prediction: {
        recoveryLikelihood: 70,
        expectedStayDays: 5,
        complications: ['Unable to predict - system error'],
        dischargeIndicators: ['Please assess manually'],
        confidence: 0
      }
    }
  }
} 