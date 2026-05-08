import dataclasses
import json

import pydantic
from openai import OpenAI

from keep.contextmanager.contextmanager import ContextManager
from keep.providers.base.base_provider import BaseProvider
from keep.providers.models.provider_config import ProviderConfig


@pydantic.dataclasses.dataclass
class QwenProviderAuthConfig:
    api_key: str = dataclasses.field(
        metadata={
            "required": True,
            "description": "Qwen API key",
            "sensitive": True,
        },
    )
    base_url: str = dataclasses.field(
        metadata={
            "required": False,
            "description": "Qwen compatible OpenAI base URL",
            "sensitive": False,
        },
        default="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    model: str = dataclasses.field(
        metadata={
            "required": False,
            "description": "Default Qwen model",
            "sensitive": False,
        },
        default="qwen3.6-plus",
    )


class QwenProvider(BaseProvider):
    PROVIDER_DISPLAY_NAME = "Qwen"
    PROVIDER_CATEGORY = ["AI"]

    def __init__(
        self, context_manager: ContextManager, provider_id: str, config: ProviderConfig
    ):
        super().__init__(context_manager, provider_id, config)

    def validate_config(self):
        self.authentication_config = QwenProviderAuthConfig(**self.config.authentication)

    def dispose(self):
        pass

    def validate_scopes(self) -> dict[str, bool | str]:
        return {}

    def _query(
        self,
        prompt,
        model=None,
        max_tokens=1024,
        structured_output_format=None,
    ):
        selected_model = model or self.authentication_config.model
        client = OpenAI(
            api_key=self.authentication_config.api_key,
            base_url=self.authentication_config.base_url,
        )

        response = client.chat.completions.create(
            model=selected_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            response_format=structured_output_format,
        )

        content = response.choices[0].message.content
        try:
            content = json.loads(content)
        except Exception:
            pass

        return {"response": content}
