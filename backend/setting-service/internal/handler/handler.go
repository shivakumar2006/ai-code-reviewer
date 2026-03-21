package handler

import (
	"setting-service/internal/service"

	"github.com/go-chi/chi/v5"
)

type ProviderHandler struct {
	svc service.ProviderService
}

func NewProviderHandler(svc service.ProviderService) *ProviderHandler {
	return &ProviderHandler{
		svc: svc,
	}
}

// rregister router wires public (jwt protected) routes onto the router
func (h *ProviderHandler) RegisterRoutes(r chi.Router) {
	r.Post("/users/providers", h.SaveProvider)
	r.Get("/users/providers", h.GetSettings)
	r.Delete("/users/providers", h.DeleteProvider)
	r.Post("/users/github", h.SaveGithub)
	r.Delete("/users/github", h.DeleteGithub)
	r.Post("/users/gitlab", h.SaveGitlab)
	r.Delete("/users/gitlab", h.DeleteGitlab)
	r.Post("/users/bitbucket", h.SaveBitbucket)
	r.Delete("/users/bitbucket", h.DeleteBitbucket)
	r.Post("/users/azure", h.SaveAzure)
	r.Delete("/users/azure", h.DeleteAzure)
}
