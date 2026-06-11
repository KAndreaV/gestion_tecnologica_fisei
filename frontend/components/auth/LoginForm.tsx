"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/features/auth/auth.hooks";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, isLoading, error, clearError } = useLogin();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login({ email, password, rememberMe });
    } catch {
      // El estado de error se maneja en el hook.
    }
  };

  return (
    <form className="auth-copy" onSubmit={handleSubmit}>
      <Input
        id="email"
        label="Correo institucional"
        type="email"
        value={email}
        autoComplete="email"
        onChange={(event) => {
          clearError();
          setEmail(event.target.value);
        }}
        suffix="@"
      />

      <Input
        id="password"
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        value={password}
        autoComplete="current-password"
        onChange={(event) => {
          clearError();
          setPassword(event.target.value);
        }}
        suffix={
          <span
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        }
      />

      <div className="row">
        <label className="remember">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span className="dot" aria-hidden="true" />
          Recordarme
        </label>


      </div>

      {error ? <div className="auth-errors">{error}</div> : null}

      <div className="actions">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Entrar al sistema"}
        </Button>
      </div>

      <div className="helper">Soporte TI: soporte@empresa.com | Anexo 104</div>
    </form>
  );
}