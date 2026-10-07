/** Minimal WebGPU surface used by the instrument lab. The installed TypeScript DOM lib does not ship these yet. */

interface GPU {
  requestAdapter(): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): GPUTextureFormat;
}

interface Navigator {
  readonly gpu?: GPU;
}

type GPUTextureFormat = "bgra8unorm" | "rgba8unorm";

interface GPUAdapter {
  requestDevice(): Promise<GPUDevice>;
}

interface GPUShaderModule {
  getCompilationInfo(): Promise<{ messages: Array<{ type: string }> }>;
}

interface GPUBuffer {
  destroy(): void;
}

interface GPUBindGroupLayout {}

interface GPUBindGroup {}

interface GPUTextureView {}

interface GPUCommandBuffer {}

interface GPURenderPipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUQueue {
  writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: BufferSource): void;
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  setVertexBuffer(slot: number, buffer: GPUBuffer): void;
  draw(vertexCount: number, instanceCount?: number): void;
  end(): void;
}

interface GPUCommandEncoder {
  beginRenderPass(descriptor: {
    colorAttachments: Array<{
      view: GPUTextureView;
      clearValue: { r: number; g: number; b: number; a: number };
      loadOp: "clear";
      storeOp: "store";
    }>;
  }): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}

interface GPUBlendComponent {
  srcFactor: string;
  dstFactor: string;
  operation: string;
}

interface GPUBlendState {
  color: GPUBlendComponent;
  alpha: GPUBlendComponent;
}

interface GPUVertexBufferLayout {
  arrayStride: number;
  stepMode?: "vertex" | "instance";
  attributes: Array<{ shaderLocation: number; offset: number; format: string }>;
}

interface GPUDevice {
  queue: GPUQueue;
  createShaderModule(descriptor: { code: string }): GPUShaderModule;
  createRenderPipeline(descriptor: {
    layout: "auto";
    vertex: { module: GPUShaderModule; entryPoint: string; buffers?: GPUVertexBufferLayout[] };
    fragment: {
      module: GPUShaderModule;
      entryPoint: string;
      targets: Array<{ format: GPUTextureFormat; blend?: GPUBlendState }>;
    };
    primitive: { topology: string };
  }): GPURenderPipeline;
  createBuffer(descriptor: { size: number; usage: number }): GPUBuffer;
  createBindGroup(descriptor: {
    layout: GPUBindGroupLayout;
    entries: Array<{ binding: number; resource: { buffer: GPUBuffer } }>;
  }): GPUBindGroup;
  createCommandEncoder(): GPUCommandEncoder;
  destroy(): void;
}

declare const GPUBufferUsage: {
  readonly UNIFORM: number;
  readonly COPY_DST: number;
  readonly VERTEX: number;
};

interface GPUCanvasContext {
  configure(configuration: { device: GPUDevice; format: GPUTextureFormat; alphaMode: "opaque" | "premultiplied" }): void;
  getCurrentTexture(): { createView(): GPUTextureView };
}
