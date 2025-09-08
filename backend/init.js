#!/usr/bin/env node

/**
 * Initialization script for ICU Management System
 * This script pre-warms the database connection for serverless deployments
 */

import fetch from 'node-fetch';

const VERCEL_URL = process.env.VERCEL_URL || 'https://icu-management-system.vercel.app';

async function initializeSystem() {
  console.log('🚀 Initializing ICU Management System...');
  
  try {
    // Pre-warm the database connection
    console.log('🔄 Pre-warming database connection...');
    const initResponse = await fetch(`${VERCEL_URL}/init`, {
      method: 'GET',
      timeout: 30000
    });
    
    if (initResponse.ok) {
      const data = await initResponse.json();
      console.log('✅ Database connection initialized:', data.message);
    } else {
      console.log('⚠️ Database initialization warning:', await initResponse.text());
    }

    // Check health endpoint
    console.log('🔍 Checking system health...');
    const healthResponse = await fetch(`${VERCEL_URL}/health`, {
      method: 'GET',
      timeout: 10000
    });
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ System health check passed');
      console.log(`📊 Database status: ${health.database.status}`);
    } else {
      console.log('⚠️ Health check warning');
    }

    console.log('🎉 System initialization complete!');
    console.log(`🌐 Application URL: ${VERCEL_URL}`);
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    console.log('💡 You may need to manually visit /init or /reconnect endpoint');
  }
}

// Run initialization
initializeSystem();
