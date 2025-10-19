import { ConfigurationService } from '../../config/configuration.service';



export class PublicController {
  constructor(
    private configuration: ConfigurationService,
  ) {

  }
}