"""Project excerpts copied from the READMEs at the linked source revisions."""

PROJECTS = {
    "forge": {
        "name": "Forge",
        "title": "Forge | Ahamed Wajibu",
        "description": "A lightweight LLM inference runtime built with Rust, Go, C++ and CUDA.",
        "repository": "https://github.com/amw720386/forge",
        "languages": [
            "Rust",
            "C++",
            "CUDA",
            "Go"
        ],
        "lede": "Forge runs local models on CPU or NVIDIA GPUs, with an interactive CLI and an OpenAI-compatible chat endpoint.",
        "sections": [
            {
                "heading": "Features",
                "paragraphs": [],
                "bullets": [
                    "CPU inference with FP32, INT8 and INT4 weights",
                    "CUDA inference with FP32 and BF16 weights",
                    "Continuous batching, paged KV cache and CUDA Graphs",
                    "Interactive terminal chat (forge-cli) and HTTP serving (forge-server)",
                    "Safetensors and .forge checkpoints"
                ]
            },
            {
                "heading": "Supported models",
                "paragraphs": [
                    "Forge currently supports text-only greedy generation. The HTTP server implements a subset of OpenAI Chat Completions, including streaming. Model weights are downloaded separately; GGUF is not supported."
                ],
                "table": {
                    "headers": [
                        "Model",
                        "CPU",
                        "CUDA"
                    ],
                    "rows": [
                        [
                            "Qwen2.5-0.5B-Instruct",
                            "FP32, INT8, INT4",
                            "FP32, BF16"
                        ],
                        [
                            "SmolLM2-135M-Instruct",
                            "FP32, INT8, INT4",
                            "FP32, BF16 (experimental)"
                        ]
                    ]
                }
            }
        ],
        "links": [
            [
                "README",
                "https://github.com/amw720386/forge/blob/d0c260af3e5e3e0c6521fe4a77271fd2c13753b3/README.md"
            ],
            [
                "Benchmarks",
                "https://github.com/amw720386/forge/blob/d0c260af3e5e3e0c6521fe4a77271fd2c13753b3/docs/benchmarks.md"
            ],
            [
                "Build and tests",
                "https://github.com/amw720386/forge/blob/d0c260af3e5e3e0c6521fe4a77271fd2c13753b3/docs/build.md"
            ]
        ],
        "attribution": "A small, local, single-user chat UI for the independent Forge inference runtime. Derived from Open WebUI v0.6.5, preserving its Git history, chat layout, reusable Svelte components, Markdown rendering and code blocks. The original frontend is the work of Open WebUI's authors; see LICENSE, NOTICE and baseline verification.",
        "attribution_url": "https://github.com/amw720386/openwebui-forge/blob/4128d52a343944894e0cea3de4febe3c123fe7b5/README.md",
        "other_slug": "block-gtq-webgpu",
        "other_name": "Block-GTQ WebGPU"
    },
    "block-gtq-webgpu": {
        "name": "Block-GTQ WebGPU",
        "title": "Block-GTQ WebGPU | Ahamed Wajibu",
        "description": "A WebGPU/WGSL port of Block-GTQ key-cache compression, integrated with SmolLM2-135M-Instruct and validated with Qwen2.5-0.5B-Instruct.",
        "repository": "https://github.com/amw720386/block-gqt-webgpu",
        "languages": [
            "TypeScript",
            "WGSL",
            "Python"
        ],
        "lede": "A WebGPU/WGSL port of Block-GTQ key-cache compression, integrated with SmolLM2-135M-Instruct and validated with Qwen2.5-0.5B-Instruct.",
        "sections": [
            {
                "heading": "Results",
                "paragraphs": [
                    "SmolLM2-135M-Instruct, 4,096-token prompt, Intel Gen12LP graphics, Windows 11, Chrome 152:",
                    "At a 4,096-token prompt, persistent K storage including shared tables drops from 45.35 MiB to 20.24 MiB—about 2.24× smaller. Because V remains FP16, the full KV cache drops from 90.70 MiB to 65.60 MiB. The compressed path is slower end to end."
                ]
            },
            {
                "heading": "How it works",
                "paragraphs": [
                    "Block-GTQ allocates bit widths to RoPE frequency pairs using calibrated Q/K energy. Equal-width pairs are grouped, rotated, quantized, and packed with FP16 scales. During decode, only each new post-RoPE key is encoded. Attention reconstructs groups inside the WGSL workgroup and immediately consumes them for QK; the model path never materializes the full historical K tensor."
                ]
            },
            {
                "heading": "Limitations",
                "paragraphs": [],
                "bullets": [
                    "Only K is compressed; V remains FP16.",
                    "Block-GTQ is slower than FP16 end to end in the measured model workloads.",
                    "Full-model logits and generated text diverge. Broad model-quality retention is not established.",
                    "No out-of-memory or usable context-length advantage has been established.",
                    "Exact parity with the upstream CUDA/Triton encoder is not claimed.",
                    "Explicit buffer accounting does not measure driver reservations or physical peak VRAM."
                ]
            }
        ],
        "links": [
            [
                "README",
                "https://github.com/amw720386/block-gqt-webgpu/blob/b785f451ec3175d8cdf58a2bd1cd57815986e87b/README.md"
            ],
            [
                "Raw model run",
                "https://github.com/amw720386/block-gqt-webgpu/blob/b785f451ec3175d8cdf58a2bd1cd57815986e87b/benchmarks/raw/2026-09-15T10-43-22-413Z-model.json"
            ],
            [
                "Measurement notes",
                "https://github.com/amw720386/block-gqt-webgpu/blob/b785f451ec3175d8cdf58a2bd1cd57815986e87b/benchmarks/README.md"
            ]
        ],
        "attribution": "The algorithm and vendored oracle fragments come from JIA-Lab-research/blockgtq, pinned at commit 3fe14e7. Upstream code under vendor/blockgtq/ remains Apache-2.0 and retains its own license. The TypeScript/WGSL runtime in this repository is a separate WebGPU port.",
        "attribution_url": "https://github.com/JIA-Lab-research/blockgtq",
        "other_slug": "forge",
        "other_name": "Forge"
    }
}
