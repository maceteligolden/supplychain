import type { ActorStatus, ActorType } from "@/config/actor-types";

export type { ActorStatus, ActorType };

export interface ActorAddressInterface {
  /** Street or facility line. */
  line1?: string;
  /** City or town. */
  city: string;
  /** Region or state. */
  region: string;
  /** Country. */
  country: string;
}

export interface ActorInterface {
  /** Unique actor identifier. */
  id: string;
  /** Display name of the actor organisation. */
  name: string;
  /** Uppercase unique code. */
  code: string;
  /** Actor role in the supply chain. */
  type: ActorType;
  /** Physical address of the actor. */
  address: ActorAddressInterface;
  /** Whether the actor can be selected on new events. */
  status: ActorStatus;
  /** ISO timestamp when the actor was created. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

export type CreateActorInput = {
  name: string;
  code: string;
  type: ActorType;
  address: ActorAddressInterface;
  status: ActorStatus;
};

export type UpdateActorInput = {
  name?: string;
  code?: string;
  type?: ActorType;
  address?: Partial<ActorAddressInterface>;
  status?: ActorStatus;
};

export type GetActorsOutput = {
  actors: ActorInterface[];
  total: number;
};

export type GetActorOutput = ActorInterface;

export type DeleteActorOutput = {
  success: boolean;
  id: string;
};
