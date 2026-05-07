import importlib.util
from pathlib import Path


def _load_env_module():
    path = Path(__file__).resolve().parents[1] / "scripts" / "shared" / "env_file.py"
    spec = importlib.util.spec_from_file_location("varnam_env_file", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_get_env_reads_repo_env_without_shell_export(tmp_path, monkeypatch):
    env_file = _load_env_module()
    repo_env = tmp_path / ".env"
    repo_env.write_text(
        "GOOGLE_API_KEY=from-repo-file\n"
        "export ELEVEN_LABS_API_KEY='eleven-file-key'\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(env_file, "REPO_ENV_PATH", repo_env)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    monkeypatch.delenv("ELEVEN_LABS_API_KEY", raising=False)

    assert env_file.get_env("GOOGLE_API_KEY") == "from-repo-file"
    assert env_file.require_env("ELEVEN_LABS_API_KEY") == "eleven-file-key"


def test_repo_env_overrides_shell_env_when_present(tmp_path, monkeypatch):
    env_file = _load_env_module()
    repo_env = tmp_path / ".env"
    repo_env.write_text("GOOGLE_API_KEY=from-repo-file\n", encoding="utf-8")
    monkeypatch.setattr(env_file, "REPO_ENV_PATH", repo_env)
    monkeypatch.setenv("GOOGLE_API_KEY", "from-shell")

    assert env_file.get_env("GOOGLE_API_KEY") == "from-repo-file"


def test_missing_repo_env_uses_default_not_shell_env(tmp_path, monkeypatch):
    env_file = _load_env_module()
    monkeypatch.setattr(env_file, "REPO_ENV_PATH", tmp_path / "missing-repo.env")
    monkeypatch.setenv("GOOGLE_API_KEY", "from-shell")

    assert env_file.get_env("GOOGLE_API_KEY", "fallback") == "fallback"
