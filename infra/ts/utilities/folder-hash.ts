import * as pulumi from '@pulumi/pulumi'
import { hashElement, HashElementNode, HashElementOptions } from 'folder-hash'

type FolderHashArgs = { path: string } & HashElementOptions
type FolderHashInput = Inputs<FolderHashArgs>

export class FolderHash extends pulumi.Resource {
  public readonly hash: pulumi.Output<string>
  public readonly name: pulumi.Output<string>
  public readonly children: pulumi.Output<HashElementNode[]>

  constructor(name: string, args: FolderHashInput, opts?: pulumi.ResourceOptions) {
    super('FolderHash', name, false, {}, opts)

    const result = pulumi.all(args).apply(args =>
      hashElement((args as any as FolderHashArgs).path, args))
    
    this.hash = result.hash
    this.name = result.name
    this.children = result.children
  }
}

type Inputs<T extends object> = { [K in keyof T]: pulumi.Input<T[K]> }
