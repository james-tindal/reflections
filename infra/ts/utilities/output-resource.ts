import * as pulumi from '@pulumi/pulumi'
import * as dynamic from '@pulumi/pulumi/dynamic'

const passthroughProvider: dynamic.ResourceProvider = {
  create: async inputs => ({ id: String(Math.random()), outs: inputs })
}

let count = 0
export class OutputResource<T> extends dynamic.Resource {
  value!: pulumi.Output<T>
  constructor(output: pulumi.Input<T>, opts?: pulumi.CustomResourceOptions) {
    const name = `output-resource-${++count}`
    super(passthroughProvider, name, { value: output }, opts)
  }
}
