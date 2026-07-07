import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/useAuthStore';

import styles from './index.style.scss';

type AuthMode = 'login' | 'register';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(username: string, password: string) {
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();

  if (!normalizedUsername) {
    return '请输入邮箱账号';
  }

  if (!EMAIL_PATTERN.test(normalizedUsername)) {
    return '账号需为邮箱格式';
  }

  if (!normalizedPassword) {
    return '请输入密码';
  }

  if (normalizedPassword.length < 6) {
    return '密码不能少于 6 位';
  }

  return '';
}

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isRegisterMode = mode === 'register';

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateCredentials(username, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (isRegisterMode) {
      const registerResult = register(username, password);

      if (registerResult === 'exists') {
        setError('该邮箱已注册，请直接登录');
        return;
      }

      if (registerResult === 'invalid') {
        setError('请输入有效的邮箱账号和密码');
        return;
      }

      setError('');
      navigate('/dashboard', { replace: true });
      return;
    }

    const isValid = login(username, password);

    if (!isValid) {
      setError('账号或密码错误，请先注册或检查输入');
      return;
    }

    setError('');
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className={styles['login-page']}>
      <section className={styles['login-panel']} aria-labelledby="login-title">
        <div className={styles['login-panel__intro']}>
          <p className="login-panel__eyebrow">Website Admin</p>
          <h1 id="login-title">{isRegisterMode ? '注册账号' : '账号密码登录'}</h1>
          <p>
            {isRegisterMode
              ? '创建邮箱账号后进入内容管理后台。'
              : '欢迎进入内容管理后台。'}
          </p>
        </div>

        <div className="auth-switch" role="tablist" aria-label="账号操作">
          <button
            aria-selected={!isRegisterMode}
            className={`auth-switch__tab${!isRegisterMode ? ' auth-switch__tab--active' : ''}`}
            role="tab"
            type="button"
            onClick={() => handleModeChange('login')}
          >
            登录
          </button>
          <button
            aria-selected={isRegisterMode}
            className={`auth-switch__tab${isRegisterMode ? ' auth-switch__tab--active' : ''}`}
            role="tab"
            type="button"
            onClick={() => handleModeChange('register')}
          >
            注册
          </button>
        </div>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <label className="field">
            <span>账号</span>
            <input
              autoComplete="username"
              inputMode="email"
              name="username"
              placeholder="请输入邮箱账号"
              type="email"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="field">
            <span>密码</span>
            <input
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              minLength={6}
              name="password"
              placeholder={isRegisterMode ? '请输入至少 6 位密码' : '请输入密码'}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button button--primary" type="submit">
            {isRegisterMode ? '注册并进入' : '登录'}
          </button>
        </form>
      </section>
    </main>
  );
}
