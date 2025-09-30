"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLoginLoading } from "@/hooks/useLoading";

interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative group">
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-background transition-all duration-300 ease-in-out pt-2 cursor-text"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
          {icon}
        </div>

        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent pl-10 pr-12 py-4 pt-6 text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder=""
        />

        <label className={`absolute left-10 transition-all duration-300 ease-in-out pointer-events-none ${isFocused || value
          ? 'top-2 text-xs text-primary font-medium transform scale-90 origin-left'
          : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground'
          }`}>
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {isHovering && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`
            }}
          />
        )}
      </div>
    </div>
  );
};

const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || 800);
        this.y = Math.random() * (canvas?.height || 600);
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (canvas && this.x > canvas.width) this.x = 0;
        if (canvas && this.x < 0) this.x = canvas.width;
        if (canvas && this.y > canvas.height) this.y = 0;
        if (canvas && this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export const Component: React.FC = () => {
  const { login, register } = useAuth();
  const router = useRouter();
  const { isLoading: loginLoading, startLoading } = useLoginLoading();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginMessage("");
    setLoginSuccess(null);

    // Start loading animation (3 seconds)
    startLoading();

    try {
      // Validation
      if (!email || !password) {
        setLoginMessage("Email dan password harus diisi!");
        setLoginSuccess(false);
        setIsSubmitting(false);
        return;
      }

      if (isSignUp && !name) {
        setLoginMessage("Nama lengkap harus diisi!");
        setLoginSuccess(false);
        setIsSubmitting(false);
        return;
      }

      if (isSignUp) {
        // Register new user
        await register(email, email, password, name);
        setLoginMessage("Registrasi berhasil! Anda telah login otomatis.");
        setLoginSuccess(true);
      } else {
        // Login existing user
        await login(email, password);
        setLoginMessage("Login berhasil! Selamat datang.");
        setLoginSuccess(true);
      }

      // Redirect to dashboard after successful login/register and loading animation completes
      setTimeout(() => {
        router.push('/');
      }, 3500); // 3 seconds loading + 0.5 seconds buffer

    } catch (error: unknown) {
      console.error('Authentication error:', error);
      const errorMessage = (error as Error).message || 'Terjadi kesalahan. Silakan coba lagi.';

      if (errorMessage.includes('401') || errorMessage.includes('Invalid credentials')) {
        setLoginMessage("Email atau password salah. Silakan coba lagi.");
      } else if (errorMessage.includes('already exists')) {
        setLoginMessage("Email sudah terdaftar. Silakan gunakan email lain atau login.");
      } else {
        setLoginMessage(errorMessage);
      }

      setLoginSuccess(false);
    }

    setIsSubmitting(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
    setLoginMessage("");
    setLoginSuccess(null);
  };

  return (
    <>
      {/* Loading Screen for Login/Register */}
      <LoadingScreen
        isVisible={loginLoading}
        message={isSignUp ? "Creating your account..." : "Signing you in..."}
      />

      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingParticles />

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <AnimatedFormField
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User size={18} />}
                />
              )}

              <AnimatedFormField
                type="text"
                placeholder="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (loginMessage) {
                    setLoginMessage("");
                    setLoginSuccess(null);
                  }
                }}
                icon={<Mail size={18} />}
              />

              <AnimatedFormField
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginMessage) {
                    setLoginMessage("");
                    setLoginSuccess(null);
                  }
                }}
                icon={<Lock size={18} />}
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
              />

              {/* Login Message */}
              {loginMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center transition-all duration-300 ${loginSuccess
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                  {loginMessage}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>

                {!isSignUp && (
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium transition-all duration-300 ease-in-out hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className={`transition-opacity duration-200 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </span>

                {isSubmitting && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </button>
            </form>

            {/* API Info */}
            {/* Helper text removed as requested */}
            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  {isSignUp ? 'Masuk di sini' : 'Daftar di sini'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};