using Microsoft.AspNetCore.Mvc;
using Netocracy.Console.Business;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("tribes")]
    public class TribeController : ControllerBase
    {
        private readonly TribeService _service;

        public TribeController(TribeService service) => _service = service;

        [HttpPost]
        public Task<Tribe[]> ComputeTribes([FromBody] Individual[] individuals)
            => _service.ComputeTribes(individuals);
    }
}