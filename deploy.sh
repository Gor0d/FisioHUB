#!/bin/bash

# FisioHUB Deployment Script
# This script handles automated deployment with Docker

set -e  # Exit on any error

# Configuration
PROJECT_NAME="fisiohub"
ENVIRONMENT=${1:-development}
BACKUP_DIR="./backups"

echo "🚀 Starting FisioHUB deployment for environment: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed or not in PATH"
        exit 1
    fi
    log_success "docker-compose is available"
}

# Create backup of database
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating database backup..."
        mkdir -p $BACKUP_DIR
        
        timestamp=$(date +%Y%m%d_%H%M%S)
        backup_file="$BACKUP_DIR/fisiohub_backup_$timestamp.sql"
        
        docker-compose exec -T postgres pg_dump -U postgres fisiohub > "$backup_file" 2>/dev/null || {
            log_warning "Database backup failed or database doesn't exist yet"
        }
        
        if [ -f "$backup_file" ]; then
            log_success "Database backup created: $backup_file"
        fi
    fi
}

# Build and deploy services
deploy_services() {
    log_info "Building and deploying services..."
    
    case $ENVIRONMENT in
        "development")
            docker-compose up --build -d postgres redis
            log_info "Waiting for database to be ready..."
            sleep 10
            
            docker-compose up --build -d backend
            log_info "Waiting for backend to be ready..."
            sleep 20
            
            docker-compose up --build -d frontend
            ;;
        "staging"|"production")
            docker-compose --profile $ENVIRONMENT up --build -d
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log_success "Services deployed successfully"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for backend to be fully ready
    sleep 10
    
    docker-compose exec backend npx prisma migrate deploy || {
        log_warning "Migrations failed - database might be new"
        docker-compose exec backend npx prisma db push
    }
    
    log_success "Database migrations completed"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check database
    if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "✓ Database is healthy"
    else
        log_error "✗ Database health check failed"
    fi
    
    # Check Redis
    if docker-compose exec redis redis-cli ping | grep -q PONG; then
        log_success "✓ Redis is healthy"
    else
        log_error "✗ Redis health check failed"
    fi
    
    # Check backend
    sleep 5
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "✓ Backend API is healthy"
    else
        log_error "✗ Backend API health check failed"
    fi
    
    # Check frontend (only in production/staging)
    if [ "$ENVIRONMENT" != "development" ]; then
        sleep 5
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            log_success "✓ Frontend is healthy"
        else
            log_error "✗ Frontend health check failed"
        fi
    fi
}

# Display deployment info
display_info() {
    echo ""
    log_success "🎉 FisioHUB deployment completed!"
    echo ""
    echo "=== Deployment Information ==="
    echo "Environment: $ENVIRONMENT"
    echo "Project: $PROJECT_NAME"
    echo ""
    echo "=== Service URLs ==="
    echo "Backend API: http://localhost:3001"
    echo "Health Check: http://localhost:3001/health"
    
    if [ "$ENVIRONMENT" != "development" ]; then
        echo "Frontend: http://localhost:3000"
        echo "Admin Panel: http://localhost:3000/admin"
    fi
    
    echo ""
    echo "=== Useful Commands ==="
    echo "View logs: docker-compose logs -f [service]"
    echo "Stop all: docker-compose down"
    echo "Restart service: docker-compose restart [service]"
    echo "Database console: docker-compose exec postgres psql -U postgres fisiohub"
    echo "Redis console: docker-compose exec redis redis-cli"
    echo ""
}

# Cleanup function
cleanup() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "Cleaning up old containers and images..."
        docker system prune -f
        log_success "Cleanup completed"
    fi
}

# Main execution flow
main() {
    log_info "Starting deployment process..."
    
    check_docker
    check_docker_compose
    backup_database
    deploy_services
    run_migrations
    health_check
    display_info
    cleanup
    
    log_success "Deployment process completed successfully! 🚀"
}

# Handle script arguments
case "$1" in
    "development"|"staging"|"production")
        main
        ;;
    "stop")
        log_info "Stopping all services..."
        docker-compose down
        log_success "All services stopped"
        ;;
    "restart")
        log_info "Restarting all services..."
        docker-compose restart
        log_success "All services restarted"
        ;;
    "logs")
        if [ -n "$2" ]; then
            docker-compose logs -f "$2"
        else
            docker-compose logs -f
        fi
        ;;
    "clean")
        log_warning "This will remove all containers, volumes, and images!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v --rmi all
            docker system prune -af --volumes
            log_success "Complete cleanup performed"
        else
            log_info "Cleanup cancelled"
        fi
        ;;
    "help"|*)
        echo "FisioHUB Deployment Script"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  development  - Deploy in development mode"
        echo "  staging      - Deploy in staging mode"
        echo "  production   - Deploy in production mode"
        echo "  stop         - Stop all services"
        echo "  restart      - Restart all services"
        echo "  logs [service] - View logs for all services or specific service"
        echo "  clean        - Complete cleanup (removes everything)"
        echo "  help         - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 development"
        echo "  $0 production"
        echo "  $0 logs backend"
        echo "  $0 stop"
        ;;
esac