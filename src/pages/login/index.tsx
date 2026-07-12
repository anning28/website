import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiError } from '../../api/request';
import { useAuthStore } from '../../store/useAuthStore';

import styles from './index.module.scss';

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

function getClassName(...classNames: Array<string | false>) {
  return classNames.filter(Boolean).join(' ');
}

function getApiErrorStatus(error: unknown) {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const status = (error as ApiError).status;

  return typeof status === 'number' ? status : undefined;
}

function getAuthErrorMessage(error: unknown, mode: AuthMode) {
  const status = getApiErrorStatus(error);

  if (status === 409 && mode === 'register') {
    return '该邮箱已注册，请直接登录';
  }

  if (status === 401 && mode === 'login') {
    return '账号或密码错误，请先注册或检查输入';
  }

  if (status === 400) {
    return '请输入有效的邮箱账号和密码';
  }

  if (!status) {
    return '网络连接异常，请稍后重试';
  }

  return '服务暂时不可用，请稍后重试';
}

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegisterMode = mode === 'register';

  const handleModeChange = (nextMode: AuthMode) => {
    if (isSubmitting) {
      return;
    }

    setMode(nextMode);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationError = validateCredentials(username, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    const currentMode = mode;

    try {
      setIsSubmitting(true);

      if (currentMode === 'register') {
        await register(username, password);
      } else {
        await login(username, password);
      }

      setError('');
      setIsSubmitting(false);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError, currentMode));
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel} aria-labelledby="login-title">
        <div className={styles.loginPanelIntro}>
          <p className={styles.loginPanelEyebrow}>Website Admin</p>
          <h1 id="login-title">{isRegisterMode ? '注册账号' : '账号密码登录'}</h1>
          <p>
            {isRegisterMode
              ? '创建邮箱账号后进入内容管理后台。'
              : '欢迎进入内容管理后台。'}
          </p>
        </div>

        <div className={styles.authSwitch} role="tablist" aria-label="账号操作">
          <button
            aria-selected={!isRegisterMode}
            className={getClassName(
              styles.authSwitchTab,
              !isRegisterMode && styles.authSwitchTabActive,
            )}
            role="tab"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleModeChange('login')}
          >
            登录
          </button>
          <button
            aria-selected={isRegisterMode}
            className={getClassName(
              styles.authSwitchTab,
              isRegisterMode && styles.authSwitchTabActive,
            )}
            role="tab"
            type="button"
            disabled={isSubmitting}
            onClick={() => handleModeChange('register')}
          >
            注册
          </button>
        </div>

        <form
          aria-busy={isSubmitting}
          className={styles.loginForm}
          noValidate
          onSubmit={handleSubmit}
        >
          <label className={styles.field}>
            <span>账号</span>
            <input
              autoComplete="username"
              disabled={isSubmitting}
              inputMode="email"
              name="username"
              placeholder="请输入邮箱账号"
              type="email"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>密码</span>
            <input
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              disabled={isSubmitting}
              minLength={6}
              name="password"
              placeholder={isRegisterMode ? '请输入至少 6 位密码' : '请输入密码'}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className={styles.formError}>{error}</p> : null}

          <button
            className={getClassName(styles.button, styles.buttonPrimary)}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isRegisterMode
                ? '注册中...'
                : '登录中...'
              : isRegisterMode
                ? '注册并进入'
                : '登录'}
          </button>
        </form>
      </section>
    </main>
  );
}
