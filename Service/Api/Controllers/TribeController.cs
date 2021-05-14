using Microsoft.AspNetCore.Mvc;
using Netocracy.Console.Business;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("tribes")]
    public class TribeController : ControllerBase
    {
        [HttpPost]
        public Task<Tribe[]> ComputeTribes([FromBody] Individual[] individuals)
            => TribeService.ComputeTribes(individuals);
    }
}