import * as swarajyaDesignMdModule from "../../../../channels/swarajya/design.md";
import { identityFromDesignMd } from "../design-md";
import { resolveIdentity } from "../resolve";

const swarajyaDesignMd =
  typeof swarajyaDesignMdModule === "string"
    ? swarajyaDesignMdModule
    : swarajyaDesignMdModule.default;

const swarajyaIdentity = identityFromDesignMd(swarajyaDesignMd);

export const swarajyaIdentityPack = resolveIdentity(swarajyaIdentity);
export const swarajyaDebasishIdentityPack = swarajyaIdentityPack;
