import app from './app';
import dotenv from 'dotenv';

dotenv.config();

// ENV Validation (High-impact production check)
const requiredEnv = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnv = requiredEnv.filter((env) => !process.env[env]);

if (missingEnv.length > 0) {
  console.error(`❌ CRITICAL: Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});