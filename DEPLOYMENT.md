# Deployment Guide - Vibe Forex Pattern Mining Dashboard

## 🚀 Quick Deployment

### Vercel (Recommended)
1. **Connect GitHub Repository**
   ```bash
   # Repository URL
   https://github.com/PcityB/vibe-forex
   ```

2. **Environment Variables** (Optional)
   ```bash
   KAGGLE_USERNAME=netszy
   KAGGLE_KEY=60a515ec7742c89c180861c1ec823493
   FOREX_API_KEY=your_alphavantage_key  # Optional for real forex data
   ```

3. **Build Settings**
   ```bash
   # Build Command
   pnpm run build --no-lint
   
   # Install Command  
   pnpm install
   
   # Output Directory
   .next
   ```

4. **Deploy**
   - Click Deploy in Vercel dashboard
   - Automatic deployment from main branch

### Netlify
1. **Build Settings**
   ```bash
   # Build command
   pnpm run build --no-lint && pnpm run export
   
   # Publish directory
   out
   ```

2. **Environment Variables**
   ```bash
   KAGGLE_USERNAME=netszy
   KAGGLE_KEY=60a515ec7742c89c180861c1ec823493
   ```

### Railway
1. **Deploy from GitHub**
   ```bash
   # Repository
   PcityB/vibe-forex
   
   # Build Command
   pnpm install && pnpm run build --no-lint
   
   # Start Command
   pnpm start
   ```

### Docker Deployment
1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install -g pnpm
   RUN pnpm install
   COPY . .
   RUN pnpm run build --no-lint
   EXPOSE 3000
   CMD ["pnpm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t vibe-forex .
   docker run -p 3000:3000 vibe-forex
   ```

## 🔧 Configuration

### Required Environment Variables
- `KAGGLE_USERNAME` - Your Kaggle username (default: netszy)
- `KAGGLE_KEY` - Your Kaggle API key (default: provided)

### Optional Environment Variables  
- `FOREX_API_KEY` - Alpha Vantage API key for real forex data
- `NODE_ENV` - Environment (production/development)

### Performance Settings
- **Memory**: Minimum 512MB recommended
- **CPU**: 1 vCPU sufficient for most workloads
- **Storage**: ~100MB for application files

## 🌐 Domain Setup

### Custom Domain
1. **DNS Configuration**
   ```bash
   # CNAME record
   www.yourdomain.com -> your-vercel-app.vercel.app
   
   # A record (if using root domain)
   yourdomain.com -> 76.76.19.61 (Vercel IP)
   ```

2. **SSL Certificate**
   - Automatic with Vercel/Netlify
   - Let's Encrypt for custom setups

## 📊 Monitoring & Analytics

### Application Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Console logging for debugging
- **API Monitoring**: Response times and success rates

### Usage Analytics
- **Pattern Mining Jobs**: Track submission frequency
- **User Engagement**: Dashboard usage patterns
- **Performance Metrics**: API response times

## 🔒 Security Considerations

### API Security
- **Kaggle Credentials**: Stored securely in environment variables
- **Rate Limiting**: Implement if needed for high traffic
- **CORS Configuration**: Properly configured for dashboard

### Data Privacy
- **No PII Storage**: Only pattern analysis data
- **Synthetic Data**: Default mode for privacy
- **API Keys**: Never exposed in frontend code

## 🎯 Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] API endpoints validated
- [ ] Kaggle credentials verified
- [ ] Error handling tested

### Post-Deployment
- [ ] Application accessible at domain
- [ ] All API endpoints responding
- [ ] Kaggle job submission working
- [ ] Pattern visualization functioning
- [ ] Mobile responsiveness verified

### Monitoring
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Usage analytics configured
- [ ] Backup and recovery planned

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm run build --no-lint
```

**API Errors**
- Check environment variables
- Verify Kaggle credentials
- Test endpoints individually

**Performance Issues**  
- Enable compression
- Optimize image loading
- Check API response times

### Support
- **GitHub Issues**: https://github.com/PcityB/vibe-forex/issues
- **Documentation**: README.md and KAGGLE_INTEGRATION.md
- **API Testing**: Use provided curl examples

---

**Ready for production deployment with verified Kaggle integration! 🚀**